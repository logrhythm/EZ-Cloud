const jwt = require('jsonwebtoken');

// Get SQL config
const fs = require('fs');
const path = require('path');

const configJwt = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'jwt.json'), 'utf8'));

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
      jwt.verify(token, configJwt.secret, (error, user) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
        req.user = user;
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

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);
  /* eslint-enable no-unused-vars */
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
}

module.exports = {
  checkJwTokenAndSetUser,
  isLoggedIn,
  notFound,
  errorHandler
};
