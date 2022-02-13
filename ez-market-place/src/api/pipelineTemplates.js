// Express HTTP
const express = require('express');

const router = express.Router();

// Database connection
const db = require('../shared/database-connector');

// API Helpers
const {
  defaultErrorMessage,
  safePipelineTemplateUid,
  safePipelineTemplateObject
} = require('../shared/api-helpers');

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
          pipeline_templates.name,
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
            pipeline_templates.name,
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
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

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

  if (!thereWasAnError) {
    // Insert the item
    try {
      recordCreationResult = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          INSERT
            INTO \`ez-market-place\`.\`pipeline_templates\`
              (
                \`uid\`,
                \`publisher_uid\`,
                \`name\`,
                \`collection_configuration\`,
                \`mapping_configuration\`,
                \`stats\`
              )
            VALUES
              (
                :pipelineTemplateUid,
                :publisherUid,
                :templateName,
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
        templateName: pipelineTemplate.name,
        templateCollectionConfiguration: pipelineTemplate.collectionConfiguration || {},
        templateMappingConfiguration: pipelineTemplate.fieldsMapping || {},
        templateStats: pipelineTemplate.stats || {}
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error updating the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
    }
  }

  res.json(
    {
      action: 'create_pipeline_template',
      description: 'Create a new Pipeline Template',
      pageNumber: 1,
      pageSize: 1,
      found: 0,
      returned: 0,
      records: [],
      error: (thereWasAnError ? errorMessage : undefined),
      result: recordCreationResult || undefined
    }
  );
});

/**
 * Update a specific Pipeline Template
 */
router.put('/:id', async (req, res) => {
  const pipelineTemplateUid = safePipelineTemplateUid(req, 'id');
  const { publisherUid } = req.ezPublisherHeader;
  // Gather the verified Pipeline Template object from the Body of the query
  const pipelineTemplate = safePipelineTemplateObject(req);

  let recordUpdateResult = null;
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (!pipelineTemplate) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid `pipelineTemplate` provided in the HTTP Body.';
  }

  // Checking the UIDs match, as otherwise at least one of them is wrong
  if (
    pipelineTemplate
    && pipelineTemplate.pipelineTemplateUid
    && pipelineTemplate.pipelineTemplateUid !== pipelineTemplateUid
  ) {
    thereWasAnError = true;
    errorMessage = 'UID mismatch between the one provided in `pipelineTemplate` and the one provided in the HTTP Parameters.';
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

  if (!thereWasAnError) {
    // Update the item
    try {
      // Update the provided fields of the Pipeline Template. If absent, they are left as is.
      recordUpdateResult = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          UPDATE
            \`ez-market-place\`.\`pipeline_templates\`
            SET
              \`name\` = :templateName,
              ${pipelineTemplate.collectionConfiguration ? '`collection_configuration` = :templateCollectionConfiguration,' : '/* No Collection Configuration present */'}
              ${pipelineTemplate.fieldsMapping ? '`mapping_configuration` = :templateMappingConfiguration,' : '/* No Field Mapping Configuration present */'}
              ${pipelineTemplate.stats ? '`stats` = :templateStats' : '/* No Stats present */'}
            WHERE
              \`uid\`=:pipelineTemplateUid;
          `
      },
      {
        // Named parameters
        pipelineTemplateUid: pipelineTemplate.pipelineTemplateUid,
        templateName: pipelineTemplate.name,
        templateCollectionConfiguration: pipelineTemplate.collectionConfiguration || {},
        templateMappingConfiguration: pipelineTemplate.fieldsMapping || {},
        templateStats: pipelineTemplate.stats || {}
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error updating the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
    }
  }

  res.json(
    {
      action: 'update_pipeline_template',
      description: 'Update a specific Pipeline Template',
      pageNumber: 1,
      pageSize: 1,
      found: 0,
      returned: 0,
      records: [],
      error: (thereWasAnError ? errorMessage : undefined),
      result: recordUpdateResult || undefined
    }
  );
});

/**
 * Delete a specific Pipeline Template
 */
router.delete('/:id', async (req, res) => {
  const pipelineTemplateUid = safePipelineTemplateUid(req, 'id');
  const { publisherUid } = req.ezPublisherHeader;

  let recordDeletionResult = null;
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (!pipelineTemplateUid) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Pipeline Template `UID` provided in the HTTP query parameter.';
  }

  if (!publisherUid) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Publisher UID provided in the `ez-publisher` HTTP Header.';
  }

  if (!thereWasAnError) {
    // Delete the item
    try {
      recordDeletionResult = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          DELETE
            FROM
              \`ez-market-place\`.\`pipeline_templates\`
            WHERE
              \`uid\` = :pipelineTemplateUid
              AND
              \`publisher_uid\` = :publisherUid;
          `
      },
      {
        // Named parameters
        pipelineTemplateUid,
        publisherUid
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error updating the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
    }
  }

  res.json(
    {
      action: 'delete_pipeline_template',
      description: 'Delete a specific Pipeline Template',
      pageNumber: 1,
      pageSize: 1,
      found: 0,
      returned: 0,
      records: [],
      error: (thereWasAnError ? errorMessage : undefined),
      result: recordDeletionResult || undefined
    }
  );
});

module.exports = router;
