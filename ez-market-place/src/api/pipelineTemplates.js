const express = require('express');

const router = express.Router();

// Database connection
const db = require('../shared/database-connector');

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
 * Get the list of Pipeline Templates
 */
router.get('/', async (req, res) => {
  // Query the DB
  const foundRecords = await db.pool.query({
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
        AND statuses.id <= 1 -- Visible and Pending Review
      LEFT OUTER JOIN publishers
        ON publishers.uid = pipeline_templates.publisher_uid
        `
  });

  // Ship it out!
  res.json(
    {
      action: 'get_pipeline_templates',
      description: 'Get the list of Pipeline Templates',
      pageNumber: 1,
      pageSize: 100000,
      found: foundRecords.length,
      returned: foundRecords.length,
      records: foundRecords
    }
  );
});

/**
 * Get the content of a specific Pipeline Template
 */
router.get('/:id', async (req, res) => {
  const pipelineTemplateId = reqParam(req, 'id');

  let foundRecords = [];

  if (pipelineTemplateId && pipelineTemplateId.length) {
    // Query the DB
    foundRecords = [
      '🥌🎯',
      '🚀'
    ];
  }

  res.json(
    {
      action: 'get_pipeline_template_by_id',
      description: 'Get the content of a specific Pipeline Template',
      pageNumber: 1,
      pageSize: 1,
      found: 1,
      returned: 1,
      records: foundRecords
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
