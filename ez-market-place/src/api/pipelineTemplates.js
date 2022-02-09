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
  const pipelineTemplateUid = safePipelineTemplateUid(req, 'id');
  const { publisherUid } = req.ezPublisherHeader;

  let foundRecords = [];
  let thereWasAnError = false;

  if (pipelineTemplateUid && pipelineTemplateUid.length) {
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
            pipeline_templates.uid = :pipelineTemplateUid
            AND (
              statuses.id <= 1 -- Visible and Pending Review
              OR
              pipeline_templates.publisher_uid = :publisherUid -- Items's publisher can see it no matter the item's status
            )
          `
      },
      {
        // Named parameters
        pipelineTemplateUid,
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
router.post('/', async (req, res) => {
  const { publisherUid } = req.ezPublisherHeader;
  // Gather the verified Pipeline Template object from the Body of the query
  const pipelineTemplate = safePipelineTemplateObject(req);

  let recordCreationResult = null;
  const foundRecords = []; // Decided to not return the record on insertion, to prevent attacks
  let thereWasAnError = false;
  let errorMessage = 'Error updating or querying the database'; // Fall back error message

  if (!pipelineTemplate) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid `pipelineTemplate` provided in the HTTP Body.';
  }

  if (!publisherUid) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Publisher UID provided in the `ez-publisher` HTTP Header.';
  }

  // const pipelineTemplateSchema = yup.object().shape(
  //   {
  //     pipelineTemplateUid: yup.string().uuid().required(),
  //     name: yup.string().required(),
  //     collectionConfiguration: yup.object(),
  //     fieldsMapping: yup.object(),
  //     stats: yup.object()
  //   }

  // Insert the item
  try {
    // eslint-disable-next-line max-len
    // INSERT INTO `ez-market-place`.`pipeline_templates` (`uid`, `created`, `modified`, `publisher_uid`, `collection_configuration`, `mapping_configuration`, `stats`) VALUES ('uid', '2022-02-04 18:20:13', '2022-02-04 18:20:14', 'e5b8cc39-ae9d-4f1c-aa57-7a0950f4a3b1', '{coll}', '{mapping}', '{stats}');
    recordCreationResult = await db.pool.query({
      namedPlaceholders: true,
      sql: `
        INSERT
          INTO \`ez-market-place\`.\`pipeline_templates\`
            (
              \`uid\`,
              \`publisher_uid\`,
              \`collection_configuration\`,
              \`mapping_configuration\`,
              \`stats\`
            )
          VALUES
            (
              :pipelineTemplateUid,
              :publisherUid,
              :templateCollectionConfiguration,
              :templateMappingConfiguration,
              :templateStats
            );
        `
    },
    {
      // Named parameters
      pipelineTemplateUid: pipelineTemplate.pipelineTemplateUid,
      publisherUid,
      templateCollectionConfiguration: pipelineTemplate.collectionConfiguration || {},
      templateMappingConfiguration: pipelineTemplate.fieldsMapping || {},
      templateStats: pipelineTemplate.stats || {}
    });
  } catch (error) {
    thereWasAnError = true;
    errorMessage = `Error updating the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
  }

  // // Query the DB
  // try {
  //   // Query the DB
  //   foundRecords = await db.pool.query({
  //     namedPlaceholders: true,
  //     sql: `
  //       SELECT
  //         pipeline_templates.uid,
  //         statuses.name AS status,
  //         pipeline_templates.created,
  //         pipeline_templates.modified,
  //         publishers.display_name AS publisher,
  //         NULL AS collection_configuration,
  //         NULL AS mapping_configuration,
  //         pipeline_templates.stats
  //       FROM
  //         pipeline_templates
  //       INNER JOIN statuses
  //         ON pipeline_templates.status = statuses.id
  //       LEFT OUTER JOIN publishers
  //         ON publishers.uid = pipeline_templates.publisher_uid
  //       WHERE
  //         pipeline_templates.uid = :pipelineTemplateUid
  //         AND (
  //           statuses.id <= 1 -- Visible and Pending Review
  //           OR
  //           pipeline_templates.publisher_uid = :publisherUid -- Items's publisher can see it no matter the item's status
  //         )
  //       `
  //   },
  //   {
  //     // Named parameters
  //     pipelineTemplateUid: pipelineTemplate.pipelineTemplateUid,
  //     publisherUid
  //   });
  // } catch (error) {
  //   thereWasAnError = true;
  // }

  res.json(
    {
      action: 'create_pipeline_template',
      description: 'Create a new Pipeline Template',
      pageNumber: 1,
      pageSize: 1,
      found: foundRecords.length,
      returned: foundRecords.length,
      records: foundRecords,
      error: (thereWasAnError ? errorMessage : undefined),
      result: recordCreationResult || undefined
    }
  );
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
