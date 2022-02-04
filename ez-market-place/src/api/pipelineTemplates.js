// Express HTTP
const express = require('express');

const router = express.Router();

// Schema validation
const yup = require('yup');

// Database connection
const db = require('../shared/database-connector');

// Define input schemas

// UIDs of Deployment and Publisher. Passed via HTTP Header.
const headerUidsSchema = yup.object().shape(
  {
    deploymentUid: yup.string().uuid().required(),
    publisherUid: yup.string().uuid().required()
  }
);

// UID of the Pipeline Template to query/manipulate. Passed via HTTP Parameter (URL or Body).
const pipelineTemplateSchema = yup.object().shape(
  {
    pipelineTemplateUid: yup.string().uuid().required()
  }
);

/**
 * Double check the parameter exists in the request. If not, provide the provided defaultValue.
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

  // Fall back to existing by empty fields
  return {
    deploymentUid: '',
    publisherUid: ''
  };
}

/**
 * Get the list of Pipeline Templates
 */
router.get('/', async (req, res) => {
  const { deploymentUid, publisherUid } = safeHeaderUids(req);

  let foundRecords = [];
  let thereWasAnError = false;

  try {
    // Query the DB
    foundRecords = await db.pool.query({
      namedPlaceholders: true,
      sql: `
        SELECT
          pipeline_templates.uid,
          statuses.name AS status,
          pipeline_templates.created,
          pipeline_templates.modified,
          publishers.display_name AS publisher,
          NULL AS collection_configuration,
          NULL AS mapping_configuration,
          pipeline_templates.stats
        FROM
          pipeline_templates
        INNER JOIN statuses
          ON pipeline_templates.status = statuses.id
        LEFT OUTER JOIN publishers
          ON publishers.uid = pipeline_templates.publisher_uid
        WHERE
          statuses.id <= 1 -- Visible and Pending Review
          OR pipeline_templates.publisher_uid = :publisherUid
          `
    },
    {
      // Named parameters
      publisherUid
    });
  } catch (error) {
    thereWasAnError = true;
  }

  // Ship it out!
  res.json(
    {
      action: 'get_pipeline_templates',
      description: 'Get the list of Pipeline Templates',
      pageNumber: 1,
      pageSize: 100000,
      found: foundRecords.length,
      returned: foundRecords.length,
      records: foundRecords,
      error: (thereWasAnError ? 'Error querying the database' : undefined)
    }
  );
});

/**
 * Get the content of a specific Pipeline Template
 */
router.get('/:id', async (req, res) => {
  const pipelineTemplateId = reqParam(req, 'id');
  const { deploymentUid, publisherUid } = safeHeaderUids(req);

  let foundRecords = [];
  let thereWasAnError = false;

  if (pipelineTemplateId && pipelineTemplateId.length) {
    // Query the DB
    try {
      // Query the DB
      foundRecords = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          SELECT
            pipeline_templates.uid,
            statuses.name AS status,
            pipeline_templates.created,
            pipeline_templates.modified,
            publishers.display_name AS publisher,
            NULL AS collection_configuration,
            NULL AS mapping_configuration,
            pipeline_templates.stats
          FROM
            pipeline_templates
          INNER JOIN statuses
            ON pipeline_templates.status = statuses.id
          LEFT OUTER JOIN publishers
            ON publishers.uid = pipeline_templates.publisher_uid
          WHERE
            pipeline_templates.uid = :pipelineTemplateId
            AND (
              statuses.id <= 1 -- Visible and Pending Review
              OR pipeline_templates.publisher_uid = :publisherUid
            )
          `
      },
      {
        // Named parameters
        pipelineTemplateId,
        publisherUid
      });
    } catch (error) {
      thereWasAnError = true;
    }
  }

  res.json(
    {
      action: 'get_pipeline_template_by_id',
      description: 'Get the content of a specific Pipeline Template',
      pageNumber: 1,
      pageSize: 1,
      found: foundRecords.length,
      returned: foundRecords.length,
      records: foundRecords,
      error: (thereWasAnError ? 'Error querying the database' : undefined)
    }
  );
});

/**
 * Create a new Pipeline Template
 */
router.post('/', (req, res) => {
  res.json(['🥌']);
});

/**
 * Update a specific Pipeline Template
 */
router.put('/:id', (req, res) => {
  res.json(['🥌', 'id']);
});

/**
 * Delete a specific Pipeline Template
 */
router.delete('/:id', (req, res) => {
  res.json(['🥌', 'id']);
});

module.exports = router;
