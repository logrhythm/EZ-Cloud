// Schema validation
const yup = require('yup');

// Database connection
const db = require('./database-connector');

// Define input schemas

// UID of the Pipeline Template to query/manipulate. Passed via HTTP Parameter (URL or Body).
const pipelineTemplateUidSchema = yup.string().uuid().required();

// Structure for a Pipeline Template creation or update
const pipelineTemplateSchema = yup.object().shape(
  {
    pipelineTemplateUid: yup.string().uuid().required(),
    name: yup.string().required(),
    collectionConfiguration: yup.object(),
    fieldsMapping: yup.object(),
    stats: yup.object()
  }
);

// UID of the Notification/Message to query/manipulate. Passed via HTTP Parameter (URL or Body).
const notificationUidSchema = yup.string().uuid().required();

// Structure for a Notification/Message creation or update
const notificationSchema = yup.object().shape(
  {
    messageUid: yup.string().uuid(), // Only required for Updates
    senderUid: yup.string().uuid().nullable(),
    recipientUid: yup.string().uuid().nullable(),
    status: yup.string(),
    statusId: yup.number(),
    messageContent: yup.string(),
    messageTemplateCode: yup.string(),
    relatedPipelineTemplate: yup.string().uuid(),
    flags: yup.array()
  }
);

// UID of the Publisher to query/manipulate. Passed via HTTP Parameter (URL or Body).
const publisherUidSchema = yup.string().uuid().required();

// Structure for a Publisher creation or update
const publisherSchema = yup.object().shape(
  {
    publisherUid: yup.string().uuid().nullable(), // Only required for Updates
    displayName: yup.string().nullable()
  }
);

// Number of days to look back. Passed via HTTP Parameter (URL or Body).
const daysLookBackSchema = yup.number().required();

// Fall back error message
const defaultErrorMessage = 'Error updating or querying the database';

/**
 * Double check the parameter exists in the request's parameters (as per the Route).
 * If not, provide the provided defaultValue.
 * @param {*} req Express Router's request object
 * @param {*} param Name of the parameter to look for in the request
 * @param {*} defaultValue Optional fall back value if the parameter is not found
 * @returns Value of the found parameter, or the provided default value
 */
function reqParam(req, param, defaultValue = undefined) {
  return (
    // eslint-disable-next-line no-nested-ternary
    req
    && req.params
      ? (
        req.params[param] !== undefined
          ? req.params[param]
          : defaultValue
      )
      : defaultValue
  );
}

/**
 * Double check the parameter exists in the request's query (as per HTTP URL query).
 * If not, provide the provided defaultValue.
 * @param {*} req Express Router's request object
 * @param {*} param Name of the parameter to look for in the request
 * @param {*} defaultValue Optional fall back value if the parameter is not found
 * @returns Value of the found parameter, or the provided default value
 */
function reqQuery(req, param, defaultValue = undefined) {
  return (
    // eslint-disable-next-line no-nested-ternary
    req
    && req.query
      ? (
        req.query[param] !== undefined
          ? req.query[param]
          : defaultValue
      )
      : defaultValue
  );
}

/**
 * Extract and sanitise Pipeline Template UID
 * @param {*} req Express Router's request object
 * @param {*} idParamName Name of the parameter to look for in the request
 * @returns Sanitised Pipeline Template UID
 */
function safePipelineTemplateUid(req, idParamName) {
  // Get the raw UID
  const pipelineTemplateUid = reqParam(req, idParamName);

  // Check validity
  if (pipelineTemplateUidSchema.isValidSync(pipelineTemplateUid)) {
    return pipelineTemplateUid;
  }

  // Fall back to a NULL UID
  return null;
}

/**
 * Extract and sanitise Pipeline Template object
 * @param {*} req Express Router's request object
 * @returns Sanitised Pipeline Template object
 */
function safePipelineTemplateObject(req) {
  // Get the raw Pipeline Template object
  const pipelineTemplateObject = (
    req
    && req.body
    && req.body.pipelineTemplate
      ? req.body.pipelineTemplate
      : null
  );

  // Check validity
  if (pipelineTemplateSchema.isValidSync(pipelineTemplateObject)) {
    return pipelineTemplateObject;
  }

  // Fall back to a NULL object
  return null;
}

/**
 * Extract and sanitise Notification/Message UID
 * @param {*} req Express Router's request object
 * @param {*} idParamName Name of the parameter to look for in the request
 * @returns Sanitised Notification/Message UID
 */
function safeNotificationUid(req, idParamName) {
  // Get the raw UID
  const messageUid = reqParam(req, idParamName);

  // Check validity
  if (notificationUidSchema.isValidSync(messageUid)) {
    return messageUid;
  }

  // Fall back to a NULL UID
  return null;
}

/**
 * Extract and sanitise Notification/Message object
 * @param {*} req Express Router's request object
 * @returns Sanitised Notification/Message object
 */
function safeNotificationObject(req) {
  // Get the raw Notification/Message object
  const notificationObject = (
    req
    && req.body
    && req.body.notification
      ? req.body.notification
      : null
  );

  // Check validity
  if (notificationSchema.isValidSync(notificationObject)) {
    return notificationObject;
  }

  // Fall back to a NULL object
  return null;
}

/**
 * Extract and sanitise Publisher UID
 * @param {*} req Express Router's request object
 * @param {*} idParamName Name of the parameter to look for in the request
 * @returns Sanitised Publisher UID
 */
function safePublisherUid(req, idParamName) {
  // Get the raw UID
  const publisherUid = reqParam(req, idParamName);

  // Check validity
  if (publisherUidSchema.isValidSync(publisherUid)) {
    return publisherUid;
  }

  // Fall back to a NULL UID
  return null;
}

/**
 * Extract and sanitise Publisher object
 * @param {*} req Express Router's request object
 * @returns Sanitised Publisher object
 */
function safePublisherObject(req) {
  // Get the raw Publisher object
  const publisherObject = (
    req
    && req.body
    && req.body.publisher
      ? req.body.publisher
      : null
  );

  // Check validity
  if (publisherSchema.isValidSync(publisherObject)) {
    return publisherObject;
  }

  // Fall back to a NULL object
  return null;
}

/**
 * Extract and sanitise Days Look Back
 * @param {*} req Express Router's request object
 * @param {*} idParamName Name of the parameter to look for in the request
 * @returns Sanitised Pipeline Days Look Back
 */
function safeDaysLookBackUid(req, idParamName) {
  // Get the raw Days Look Back
  const daysLookBack = reqQuery(req, idParamName);

  // Check validity
  if (daysLookBackSchema.isValidSync(daysLookBack)) {
    return daysLookBack;
  }

  // Fall back to NULL
  return null;
}

/**
 * Get the list of Statuses
 * @returns The list of Statuses
 */
async function getStatuses() {
  let foundRecords = [];
  let thereWasAnError = false;

  try {
    // Query the DB
    foundRecords = await db.pool.query({
      namedPlaceholders: true,
      sql: `
      SELECT
        statuses.id,
        statuses.name,
        statuses.description
      FROM
        statuses
      ORDER BY
        statuses.id
      `
    },
    {
      // No params
    });
  } catch (error) {
    thereWasAnError = true;
  }

  // Fall back to NULL
  return (!thereWasAnError ? foundRecords : null);
}

module.exports = {
  pipelineTemplateUidSchema,
  pipelineTemplateSchema,
  notificationUidSchema,
  notificationSchema,
  publisherUidSchema,
  publisherSchema,
  daysLookBackSchema,
  defaultErrorMessage,
  reqParam,
  reqQuery,
  safePipelineTemplateUid,
  safePipelineTemplateObject,
  safeNotificationUid,
  safeNotificationObject,
  safePublisherUid,
  safePublisherObject,
  safeDaysLookBackUid,
  getStatuses
};
