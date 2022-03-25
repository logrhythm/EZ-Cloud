// Express HTTP
const express = require('express');

const router = express.Router();

// Database connection
const db = require('../../shared/database-connector');

// Load the System Logging functions
const { logToSystem } = require('../../shared/systemLogging');

// API Helpers
const {
  defaultErrorMessage,
  safePipelineTemplateUid,
  safePipelineTemplateObject
} = require('../../shared/api-helpers');

/**
 * Get the list of Pipeline Templates
 */
router.get('/', async (req, res) => {
  let foundRecords = [];
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  try {
    // Query the DB
    foundRecords = await db.pool.query({
      namedPlaceholders: true,
      sql: `
      SELECT
        pipeline_templates.uid AS pipelineTemplateUid,
        pipeline_templates.status AS statusId,
        statuses.name AS statusName,
        statuses.description AS statusDescription,
        pipeline_templates.created AS pipelineTemplateCreatedOn,
        pipeline_templates.modified AS pipelineTemplateModifiedOn,
        pipeline_templates.publisher_uid AS publisherUid,
        publishers.display_name AS publisherName,
        pipeline_templates.name AS pipelineTemplateName,
        NULL AS pipelineTemplateReadmeMardown,
        pipeline_templates.iconPicture AS pipelineTemplateIconPicture,
        NULL AS pipelineTemplateCollectionConfiguration,
        NULL AS pipelineTemplateMappingConfiguration,
        pipeline_templates.stats AS pipelineTemplateStats
      FROM
        pipeline_templates
      INNER JOIN statuses
        ON pipeline_templates.status = statuses.id
      LEFT OUTER JOIN publishers
        ON publishers.uid = pipeline_templates.publisher_uid
      `
    },
    {
      // Named parameters
    });
  } catch (error) {
    thereWasAnError = true;
    errorMessage = `Error querying the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
    logToSystem('Debug', `${errorMessage} // ${JSON.stringify(error)}`, true);
  }

  // Log potential Error
  if (thereWasAnError) {
    logToSystem('Error', errorMessage, true);
  }

  // Ship it out!
  res.json(
    {
      action: 'get_pipeline_templates__admin',
      description: 'Get the list of all Pipeline Templates - Admin',
      pageNumber: 1,
      pageSize: 100000,
      found: foundRecords.length,
      returned: foundRecords.length,
      records: foundRecords,
      error: (thereWasAnError ? errorMessage : undefined)
    }
  );
});

/**
 * Get the content of a specific Pipeline Template
 */
router.get('/:id', async (req, res) => {
  const pipelineTemplateUid = safePipelineTemplateUid(req, 'id');

  let foundRecords = [];
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (pipelineTemplateUid && pipelineTemplateUid.length) {
    // Query the DB
    try {
      // Query the DB
      foundRecords = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          SELECT
            pipeline_templates.uid AS pipelineTemplateUid,
            pipeline_templates.status AS statusId,
            statuses.name AS statusName,
            statuses.description AS statusDescription,
            pipeline_templates.created AS pipelineTemplateCreatedOn,
            pipeline_templates.modified AS pipelineTemplateModifiedOn,
            pipeline_templates.publisher_uid AS publisherUid,
            publishers.display_name AS publisherName,
            pipeline_templates.name AS pipelineTemplateName,
            pipeline_templates.readmeMardown AS pipelineTemplateReadmeMardown,
            pipeline_templates.iconPicture AS pipelineTemplateIconPicture,
            pipeline_templates.collection_configuration AS pipelineTemplateCollectionConfiguration,
            pipeline_templates.mapping_configuration AS pipelineTemplateMappingConfiguration,
            pipeline_templates.stats AS pipelineTemplateStats
          FROM
            pipeline_templates
          INNER JOIN statuses
            ON pipeline_templates.status = statuses.id
          LEFT OUTER JOIN publishers
            ON publishers.uid = pipeline_templates.publisher_uid
          WHERE
            pipeline_templates.uid = :pipelineTemplateUid
        `
      },
      {
        // Named parameters
        pipelineTemplateUid
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error querying the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
      logToSystem('Debug', `${errorMessage} // ${JSON.stringify(error)}`, true);
    }
  } else {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Pipeline Template `UID` provided in the HTTP Query.';
  }

  // Log potential Error
  if (thereWasAnError) {
    logToSystem('Error', errorMessage, true);
  }

  res.json(
    {
      action: 'get_pipeline_template_by_id__admin',
      description: 'Get the content of a specific Pipeline Template - Admin',
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
  // Gather the verified Pipeline Template object from the Body of the query
  const pipelineTemplate = safePipelineTemplateObject(req);

  let recordCreationResult = null;
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (!pipelineTemplate) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid `pipelineTemplate` provided in the HTTP Body.';
  }

  if (!thereWasAnError) {
    // Safely parse the Stats
    let templateStats = null;
    try {
      templateStats = JSON.stringify(pipelineTemplate.stats || {});
    } catch (error) {
      // Fail silently
    }

    // Insert the item
    try {
      recordCreationResult = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          INSERT
            INTO \`pipeline_templates\`
              (
                \`uid\`
                ${pipelineTemplate.statusId !== null ? ', `status`' : '/* No Status present */'}
                ${pipelineTemplate.publisherUid !== undefined ? ', `publisher_uid`' : '/* No Publisher UID present */'}
                ${pipelineTemplate.name !== undefined ? ', `name`' : '/* No Name present */'}
                ${pipelineTemplate.readmeMardown ? ', `readmeMardown`' : '/* No Readme present */'}
                ${pipelineTemplate.iconPicture ? ', `iconPicture`' : '/* No Icon Picture present */'}
                ${pipelineTemplate.collectionConfiguration ? ', `collection_configuration`' : '/* No Collection Configuration present */'}
                ${pipelineTemplate.fieldsMapping ? ', `mapping_configuration`' : '/* No Mapping Configuration present */'}
                ${pipelineTemplate.stats ? ', `stats`' : '/* No Stats present */'}
              )
            VALUES
              (
                :pipelineTemplateUid
                ${pipelineTemplate.statusId !== null ? ', :pipelineTemplateStatusAsInt' : '/* No Status present */'}
                ${pipelineTemplate.publisherUid !== undefined ? ', :publisher_uid' : '/* No Publisher UID present */'}
                ${pipelineTemplate.name !== undefined ? ', :name' : '/* No Name present */'}
                ${pipelineTemplate.readmeMardown ? ', :readmeMardown' : '/* No Readme present */'}
                ${pipelineTemplate.iconPicture ? ', :iconPicture' : '/* No Icon Picture present */'}
                ${pipelineTemplate.collectionConfiguration ? ', :collection_configuration' : '/* No Collection Configuration present */'}
                ${pipelineTemplate.fieldsMapping ? ', :mapping_configuration' : '/* No Mapping Configuration present */'}
                ${pipelineTemplate.stats ? ', :stats' : '/* No Stats present */'}
              );
          `
      },
      {
        // Named parameters
        pipelineTemplateUid: pipelineTemplate.pipelineTemplateUid,
        pipelineTemplateStatusAsInt: pipelineTemplate.statusId,
        publisher_uid: pipelineTemplate.publisherUid,
        name: pipelineTemplate.name,
        readmeMardown: pipelineTemplate.readmeMardown,
        iconPicture: pipelineTemplate.iconPicture,
        collection_configuration: pipelineTemplate.collectionConfiguration,
        mapping_configuration: pipelineTemplate.fieldsMapping,
        stats: templateStats // Already parsed above
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error updating the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
      logToSystem('Debug', `${errorMessage} // ${JSON.stringify(error)}`, true);
    }
  }

  // Log potential Error
  if (thereWasAnError) {
    logToSystem('Error', errorMessage, true);
  }

  res.json(
    {
      action: 'create_pipeline_template__admin',
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

  if (!thereWasAnError) {
    // Safely parse the Stats
    let templateStats = null;
    try {
      templateStats = JSON.stringify(pipelineTemplate.stats || {});
    } catch (error) {
      // Fail silently
    }

    logToSystem('Debug', `Admin - Update a specific Pipeline Template (update_pipeline_template__admin) - Pipeline Template // ${JSON.stringify(pipelineTemplate)}`, true);

    // Update the item
    try {
      const sql = `
      UPDATE
        \`pipeline_templates\`
        SET
          \`uid\` = \`uid\` /* Bogus line. Will change nothing. But help with commas for the subsequent lines. */
          ${pipelineTemplate.statusId !== null ? ', `status` = :pipelineTemplateStatusAsInt' : '/* No Status present */'}
          ${pipelineTemplate.publisherUid !== undefined ? ', `publisher_uid` = :publisher_uid' : '/* No Publisher UID present */'}
          ${pipelineTemplate.name !== undefined ? ', `name` = :name' : '/* No Name present */'}
          ${pipelineTemplate.readmeMardown !== undefined ? ', `readmeMardown` = :readmeMardown' : '/* No Readme present */'}
          ${pipelineTemplate.iconPicture !== undefined ? ', `iconPicture` = :iconPicture' : '/* No Icon Picture present */'}
          ${pipelineTemplate.collectionConfiguration ? ', `collection_configuration` = :collection_configuration' : '/* No Collection Configuration present */'}
          ${pipelineTemplate.fieldsMapping ? ', `mapping_configuration` = :mapping_configuration' : '/* No Mapping Configuration present */'}
          ${pipelineTemplate.stats ? ', `stats` = :stats' : '/* No Stats present */'}

          
        WHERE
          \`uid\` = :pipelineTemplateUid;
      `;

      const parameters = {
        // Named parameters
        pipelineTemplateUid: pipelineTemplate.pipelineTemplateUid,
        pipelineTemplateStatusAsInt: pipelineTemplate.statusId,
        publisher_uid: pipelineTemplate.publisherUid,
        name: pipelineTemplate.name,
        readmeMardown: pipelineTemplate.readmeMardown,
        iconPicture: pipelineTemplate.iconPicture,
        collection_configuration: pipelineTemplate.collectionConfiguration,
        mapping_configuration: pipelineTemplate.fieldsMapping,
        stats: templateStats // Already parsed above
      };

      logToSystem('Debug', `Admin - Update a specific Pipeline Template (update_pipeline_template__admin) - SQL and Parameters // ${JSON.stringify(sql)} // ${JSON.stringify(parameters)}`, true);

      // Update some of provided fields. If absent, they are left as is.
      recordUpdateResult = await db.pool.query({
        namedPlaceholders: true,
        sql
      },
      parameters);
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error updating the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
      logToSystem('Debug', `${errorMessage} // ${JSON.stringify(error)}`, true);
    }
  }

  // Log potential Error
  if (thereWasAnError) {
    logToSystem('Error', errorMessage, true);
  }

  res.json(
    {
      action: 'update_pipeline_template__admin',
      description: 'Update a specific Pipeline Template - Admin',
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

  let recordDeletionResult = null;
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (!pipelineTemplateUid) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Pipeline Template `UID` provided in the HTTP query parameter.';
  }

  if (!thereWasAnError) {
    // Delete the item
    try {
      recordDeletionResult = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          DELETE
            FROM
              \`pipeline_templates\`
            WHERE
              \`uid\` = :pipelineTemplateUid
          `
      },
      {
        // Named parameters
        pipelineTemplateUid
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error updating the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
      logToSystem('Debug', `${errorMessage} // ${JSON.stringify(error)}`, true);
    }
  }

  // Log potential Error
  if (thereWasAnError) {
    logToSystem('Error', errorMessage, true);
  }

  res.json(
    {
      action: 'delete_pipeline_template__admin',
      description: 'Delete a specific Pipeline Template - Admin',
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
