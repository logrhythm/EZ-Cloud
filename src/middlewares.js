// To manage the JWT Token
const jwt = require('jsonwebtoken');

// Get SQL config
const fs = require('fs');
const path = require('path');

// Load the System Logging functions
const { logToSystem } = require('./shared/systemLogging');

// Import Config Loaders
const {
  getJwtConfig
} = require('./shared/loadConfigUtils');

// Returns the Access Denied error
function accessDenied(res, next) {
  const error = new Error('Access Denied');
  res.status(401);
  next(error);
}

// Check for Authentication token, and if a valid one is found, extract the username from it
async function checkJwTokenAndSetUser(req, res, next) {
  const authHeader = req.get('Authorization');
  // Get JWT Secret and TTL
  const configJwt = await getJwtConfig();

  if (authHeader && authHeader.length && configJwt && configJwt.secret && configJwt.secret.length) {
    const token = String(authHeader).replace(/^Bearer /, '');
    if (token) {
      // use jwt lib to decode
      jwt.verify(token, configJwt.secret, (error, decodedPayload) => {
        // decodedPayload should contain something like:
        // {"username":"tmasse","roles":["Admin"],"iat":1637363428,"exp":1637449828}
        if (error) {
          logToSystem('Error', error);
        }
        logToSystem('Debug', `checkJwTokenAndSetUser - ${JSON.stringify(decodedPayload)}`);
        req.user = decodedPayload;
        next();
      });
    } else {
      next();
    }
  } else {
    next();
  }
}

// Check the user is logged in
function isLoggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    accessDenied(res, next);
  }
}

// Check if the logged user is and Admin
function isAdmin(req, res, next) {
  // if (req.user && req.user.roles && Array.isArray(req.user.roles) && req.user.roles.includes('Admin')) {
  if (req.user && req.user.isPrivileged === true) {
    next();
  } else {
    accessDenied(res, next);
  }
}

// Log the Web requests / responses to the System Journal
function logHttpToSystem(req, res, next) {
  logToSystem('Verbose', `HTTP Request | client_ip: ${(req.socket && req.socket._peername && req.socket._peername.address ? req.socket._peername.address : '-')} | client_port: ${(req.socket && req.socket._peername && req.socket._peername.port ? req.socket._peername.port : '-')} | username: ${(req.user && req.user.username ? req.user.username : '-')} | roles: ${(req.user && req.user.roles ? req.user.roles.join(',') : '-')} | method: ${(req.method ? req.method : '-')} | path: ${(req.url ? req.url : '-')}`);
  next();
}

function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found');
  next(error);
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);

  // Error code
  const code = err.code || `HTTP Return Code: ${res.statusCode}`;

  /* eslint-enable no-unused-vars */
  res.json({
    code,
    message: process.env.NODE_ENV === 'production' ? '__REDACTED__' : err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
  logToSystem('Error', `HTTP Error | client_ip: ${(req.socket && req.socket._peername && req.socket._peername.address ? req.socket._peername.address : '-')} | client_port: ${(req.socket && req.socket._peername && req.socket._peername.port ? req.socket._peername.port : '-')} | username: ${(req.user && req.user.username ? req.user.username : '-')} | roles: ${(req.user && req.user.roles ? req.user.roles.join(',') : '-')} | method: ${(req.method ? req.method : '-')} | path: ${(req.url ? req.url : '-')} | error code: ${code}`);
}

/* eslint-disable no-unused-vars */
function serveFileSafely(req, res, next) {
  if (req && req.params && req.params.file) {
    if (String(req.params.file || '').indexOf('\0') !== -1) {
      // Got a char #0 in the filename/path? Go get lost.
      notFound(req, res, next);
    } else {
      // Build full path
      const safePath = path.join(
        process.env.baseDirname,
        'public_web_root',
        path.normalize(req.params.file || '').replace(/\.\.(\/|\\|$)/g, '') // strip any "../" and "..\"
      );

      // Check file exists
      fs.stat(safePath, (err, stat) => {
        if (err == null) {
          // Good to go, serve the file
          res.sendFile(safePath);
        } else if (err.code === 'ENOENT') {
          // File does not exist
          notFound(req, res, next);
        } else {
          // no idea what's going on. Too bad, mate.
          res.status(500);
          const error = new Error('File could\'t be served');
          next(error);
        }
      });
    }
  } else { // No file was asked for
    res.status(500);
    const error = new Error('No file was asked for.');
    next(error);
  }
}

// To protect against clickjacking
// (strongly) Inspired by https://auth0.com/blog/preventing-clickjacking-attacks/
function setXFrameOptions(req, res, next) {
  res.setHeader('X-Frame-Options', 'sameorigin');
  next();
}

// To protect against clickjacking
// (strongly) Inspired by https://auth0.com/blog/preventing-clickjacking-attacks/
function setContentSecurityPolicy(req, res, next) {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self';");
  next();
}

module.exports = {
  checkJwTokenAndSetUser,
  isLoggedIn,
  isAdmin,
  logHttpToSystem,
  notFound,
  errorHandler,
  serveFileSafely,
  setXFrameOptions,
  setContentSecurityPolicy
};
