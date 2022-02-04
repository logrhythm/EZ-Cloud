// Express HTTP
const express = require('express');

const router = express.Router();

// Schema validation
const yup = require('yup');

// Database connection
const db = require('../shared/database-connector');

// Define input schemas

// UID of the Pipeline Template to query/manipulate. Passed via HTTP Parameter (URL or Body).
const pipelineTemplateUidSchema = yup.string().uuid().required();

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
 * Get the list of Pipeline Templates
 */
router.get('/', async (req, res) => {
  const { publisherUid } = req.ezPublisherHeader;

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
          OR
          pipeline_templates.publisher_uid = :publisherUid -- Items's publisher can see it no matter the item's status
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
  const pipelineTemplateId = safePipelineTemplateUid(req, 'id');
  const { publisherUid } = req.ezPublisherHeader;

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
              OR
              pipeline_templates.publisher_uid = :publisherUid -- Items's publisher can see it no matter the item's status
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
