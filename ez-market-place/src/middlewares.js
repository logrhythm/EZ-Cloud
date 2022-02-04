// Schema validation
const yup = require('yup');

// Load the System Logging functions
const { logToSystem } = require('./shared/systemLogging');

// -------
// LOGGING

/**
 * Log the Web requests / responses to the System Journal
 * @param {*} req Express Router's request object
 * @param {*} res Express Router's response object
 * @param {*} next Express Router's next function
 */
function logHttpToSystem(req, res, next) {
  logToSystem('Verbose', `HTTP Request | client_ip: ${(req.socket && req.socket._peername && req.socket._peername.address ? req.socket._peername.address : '-')} | client_port: ${(req.socket && req.socket._peername && req.socket._peername.port ? req.socket._peername.port : '-')} | deployment_uid: ${(req.ezPublisherHeader && req.ezPublisherHeader.deploymentUid ? req.ezPublisherHeader.deploymentUid : '-')} | publisher_uid: ${(req.ezPublisherHeader && req.ezPublisherHeader.publisherUid ? req.ezPublisherHeader.publisherUid : '-')} | method: ${(req.method ? req.method : '-')} | path: ${(req.url ? req.url : '-')}`);
  next();
}

// --------------
// ERROR HANDLING

/**
 * Return 404-Not
 * @param {*} req Express Router's request object
 * @param {*} res Express Router's response object
 * @param {*} next Express Router's next function
 */
function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found');
  next(error);
}

/* eslint-disable no-unused-vars */
/**
 * Deal and return error messages
 * @param {*} err Express Router's error object
 * @param {*} req Express Router's request object
 * @param {*} res Express Router's response object
 * @param {*} next Express Router's next function
 */
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
  logToSystem('Error', `HTTP Error | client_ip: ${(req.socket && req.socket._peername && req.socket._peername.address ? req.socket._peername.address : '-')} | client_port: ${(req.socket && req.socket._peername && req.socket._peername.port ? req.socket._peername.port : '-')} | deployment_uid: ${(req.ezPublisherHeader && req.ezPublisherHeader.deploymentUid ? req.ezPublisherHeader.deploymentUid : '-')} | publisher_uid: ${(req.ezPublisherHeader && req.ezPublisherHeader.publisherUid ? req.ezPublisherHeader.publisherUid : '-')} | method: ${(req.method ? req.method : '-')} | path: ${(req.url ? req.url : '-')} | error code: ${code}`);
}

// --------
// SECURITY

/**
 * To protect against clickjacking
 * (strongly) Inspired by https://auth0.com/blog/preventing-clickjacking-attacks/
 * @param {*} req Express Router's request object
 * @param {*} res Express Router's response object
 * @param {*} next Express Router's next function
 */
function setXFrameOptions(req, res, next) {
  res.setHeader('X-Frame-Options', 'sameorigin');
  next();
}

/**
 * To protect against clickjacking
 * (strongly) Inspired by https://auth0.com/blog/preventing-clickjacking-attacks/
 * @param {*} req Express Router's request object
 * @param {*} res Express Router's response object
 * @param {*} next Express Router's next function
 */
function setContentSecurityPolicy(req, res, next) {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self';");
  next();
}

// -----------------------------------
// EXTRACTION OF THE UIDs FROM HEADERS

// Define input schemas

// UIDs of Deployment and Publisher. Passed via HTTP Header.
const headerUidsSchema = yup.object().shape(
  {
    deploymentUid: yup.string().uuid().required(),
    publisherUid: yup.string().uuid().required()
  }
);

/**
 * Extract the UIDs of Deployement and Publisher
 * @param {*} req Express Router's request object
 * @returns Object containing both UIDs
 */
function extractHeaderUids(req) {
  const ezPublisherHeader = (
    req
    && req.headers
    && req.headers['ez-publisher']
      ? req.headers['ez-publisher']
      : ':'
  );
  const uids = ezPublisherHeader.split(':', 2);
  return {
    deploymentUid: uids[0],
    publisherUid: uids[1]
  };
}

/**
 * Safely extract the UIDs of Deployement and Publisher
 * @param {*} req Express Router's request object
 * @returns Object containing both UIDs
 */
function safeHeaderUids(req) {
  // Get the raw UIDs
  const headerUids = extractHeaderUids(req);

  // Check validity
  if (headerUidsSchema.isValidSync(headerUids)) {
    return headerUids;
  }

  // Fall back to existing but empty fields
  return {
    deploymentUid: '',
    publisherUid: ''
  };
}

/**
 * Extract the deployment and publisher UIDs from the "ez-publisher" Header and
 * store them in req.ezPublisherHeader
 * @param {*} req Express Router's request object
 * @param {*} res Express Router's response object
 * @param {*} next Express Router's next function
 */
function extractDeploymentAndPublishUids(req, res, next) {
  req.ezPublisherHeader = safeHeaderUids(req);
  next();
}

module.exports = {
  logHttpToSystem,
  notFound,
  errorHandler,
  setXFrameOptions,
  setContentSecurityPolicy,
  extractDeploymentAndPublishUids
};
