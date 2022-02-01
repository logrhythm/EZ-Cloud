// Load the System Logging functions
const { logToSystem } = require('./shared/systemLogging');

// // Returns the Access Denied error
// function accessDenied(res, next) {
//   const error = new Error('Access Denied');
//   res.status(401);
//   next(error);
// }

// Log the Web requests / responses to the System Journal
function logHttpToSystem(req, res, next) {
  logToSystem('Verbose', `HTTP Request | client_ip: ${(req.socket && req.socket._peername && req.socket._peername.address ? req.socket._peername.address : '-')} | client_port: ${(req.socket && req.socket._peername && req.socket._peername.port ? req.socket._peername.port : '-')} | user_id: ${(req.user && req.user.user_id ? req.user.user_id : '-')} | method: ${(req.method ? req.method : '-')} | path: ${(req.url ? req.url : '-')}`);
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
  logToSystem('Error', `HTTP Error | client_ip: ${(req.socket && req.socket._peername && req.socket._peername.address ? req.socket._peername.address : '-')} | client_port: ${(req.socket && req.socket._peername && req.socket._peername.port ? req.socket._peername.port : '-')} | user_id: ${(req.user && req.user.user_id ? req.user.user_id : '-')} | method: ${(req.method ? req.method : '-')} | path: ${(req.url ? req.url : '-')} | error code: ${code}`);
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
  logHttpToSystem,
  notFound,
  errorHandler,
  setXFrameOptions,
  setContentSecurityPolicy
};
