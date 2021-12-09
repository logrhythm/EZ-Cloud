// To manage the JWT Token
const jwt = require('jsonwebtoken');

// Get SQL config
const fs = require('fs');
const path = require('path');

// Load the System Logging functions
const { logToSystem } = require('./shared/systemLogging');

const configJwt = JSON.parse(fs.readFileSync(path.join(process.env.baseDirname, 'config', 'jwt.json'), 'utf8'));

// Returns the Access Denied error
function accessDenied(res, next) {
  const error = new Error('Access Denied');
  res.status(401);
  next(error);
}

// Check for Authentication token, and if a valid one is found, extract the username from it
function checkJwTokenAndSetUser(req, res, next) {
  const authHeader = req.get('Authorization');
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
  if (req.user && req.user.roles && Array.isArray(req.user.roles) && req.user.roles.includes('Admin')) {
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

  /* eslint-enable no-unused-vars */
  res.json({
    code: err.code,
    message: process.env.NODE_ENV === 'production' ? '__REDACTED__' : err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
}

/* eslint-disable no-unused-vars */
function serveFileSafely(req, res, next) {
  const safePath = path.join(
    process.env.baseDirname,
    'public_web_root',
    String(req.params.file).replace(RegExp('../', 'g'), '') // strip any "../"
  );

  fs.stat(safePath, (err, stat) => {
    if (err == null) {
      res.sendFile(safePath);
    } else if (err.code === 'ENOENT') {
      // file does not exist
      notFound(req, res, next);
    } else {
      res.status(500);
      const error = new Error('File could\'t be served');
      next(error);
    }
  });
}

module.exports = {
  checkJwTokenAndSetUser,
  isLoggedIn,
  isAdmin,
  logHttpToSystem,
  notFound,
  errorHandler,
  serveFileSafely
};
