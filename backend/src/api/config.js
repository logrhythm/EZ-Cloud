const express = require('express');

const router = express.Router();
// Get SQL config
const fs = require('fs');
const path = require('path');

const configSql = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'database.json'), 'utf8')).config;
// Create SQL object
const { Connection, Request, TYPES } = require('tedious');

function waitMilliseconds(delay = 250) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

const maxCheckInterval = 10; // Check once every X seconds max, and/or timeout after X seconds

router.get('/', (req, res) => {
  res.json({
    message: 'API - Config - All good'
  });
});

// ##########################################################################################
// getDataFromSql
// #########
// Utilitarian function to get the data from
// SQL using parameters.query and dump it in the
// parameters.targetVariable
// ##########################################################################################

async function getDataFromSql(parameters) {
  let stillChecking = true;
  if (parameters && parameters.query && parameters.query.length && parameters.targetVariable) {
    const { targetVariable, query, variables } = parameters;
    targetVariable.stillChecking = true;
    targetVariable.errors = [];
    targetVariable.outputs = [];
    targetVariable.payload = [];

    // Connect
    const connection = new Connection(configSql);

    // Connection event handler
    connection.on('connect', (connectionError) => {
      if (connectionError) {
        targetVariable.errors.push('Connection to database failed');
        targetVariable.stillChecking = false;
        stillChecking = false;
        // throw connectionError;
      }

      // Exec the query
      const request = new Request(query, (err, rowCount) => {
        if (err) {
          targetVariable.errors.push(err);
        }
        if (rowCount) {
          targetVariable.outputs.push(`${rowCount} row(s) returned`);
        }
        targetVariable.stillChecking = false;
        stillChecking = false;
      });

      if (variables && Array.isArray(variables)) {
        variables.forEach((variable) => {
          if (variable.name && variable.name.length > 0) {
            // request.addParameter(variable.name, TYPES[variable.type], (variable.value || null));
            request.addParameter(
              variable.name,
              TYPES[variable.type],
              (variable.value !== undefined ? variable.value : null)
            );
            // if (typeof variable.value === 'string') {
            //   request.addParameter(variable.name, TYPES.NVarChar, (variable.value || null));
            // }
            // if (typeof variable.value === 'number') {
            //   request.addParameter(variable.name, TYPES.Int, (variable.value || null));
            // }
            // if (typeof variable.value === 'boolean') {
            //   request.addParameter(variable.name, TYPES.TinyInt, (variable.value > 0));
            // }
            // if (variable.value === null) {
            //   request.addParameter(variable.name, TYPES.Null, null);
            // }
          }
        });
      }

      request.on('row', (columns) => {
        // Make sure targetVariable.payload is an array
        if (!targetVariable.payload || targetVariable.payload === null) {
          targetVariable.payload = [];
        }

        // Compile the row using all its columns
        const row = {};
        columns.forEach((column) => {
          row[column.metadata.colName] = column.value;
        });
        targetVariable.payload.push(row);
      });

      // And run it
      connection.execSql(request);
    });

    // Kick it all off!
    connection.connect();

    // Wait, by default, for the query to happen (or fail) before returning to caller
    if (!parameters.noWait) {
      const loopEndTime = Date.now() / 1000 + maxCheckInterval;

      // Waiting - Sync
      while (targetVariable.stillChecking && (loopEndTime > (Date.now() / 1000))) {
        // Wait for 50 ms
        // eslint-disable-next-line no-await-in-loop
        await waitMilliseconds(50);
      }
      if (stillChecking || targetVariable.stillChecking) {
        targetVariable.errors.push('Timeout');
      }
      targetVariable.stillChecking = false;
      stillChecking = false;
    }
  }
}

// ##########################################################################################
// createSqlVariables
// #########
// Utilitarian function to create the array of
// fields type mapping to be provided to
// getDataFromSql as parameters.targetVariable
// ##########################################################################################

function createSqlVariables(req, definitions) {
  const variables = [];
  if (req && (req.query || req.body) && definitions && Array.isArray(definitions)) {
    [
      { name: 'uid', type: 'NVarChar' },
      { name: 'name', type: 'NVarChar' },
      { name: 'hostname', type: 'NVarChar' },
      { name: 'port', type: 'Int' },
      { name: 'authenticationMethod', type: 'NVarChar' },
      { name: 'username', type: 'NVarChar' },
      { name: 'password', type: 'NVarChar' },
      { name: 'privateKey', type: 'NVarChar' },
      { name: 'osVersion', type: 'NVarChar' },
      { name: 'ocInstalled', type: 'TinyInt' },
      { name: 'ocVersion', type: 'NVarChar' },
      { name: 'fbInstalled', type: 'TinyInt' },
      { name: 'fbVersion', type: 'NVarChar' }
    ].filter((def) => def.name && def.type && def.name.length && def.type.length)
      .forEach((def) => {
        variables.push({
          name: def.name,
          type: def.type,
          /* eslint-disable no-nested-ternary */
          value: (
            req.body[def.name] !== undefined
              ? req.body[def.name]
              : (
                req.query[def.name] !== undefined
                  ? req.query[def.name]
                  : null
              )
          )
          /* eslint-enable no-nested-ternary */
        });
      });
  }
  return variables;
}

// ##########################################################################################
// GetCollectors
// ##########################################################################################

const collectors = {};

const collectorsPipelines = {};

router.get('/GetCollectors', async (req, res) => {
  await getDataFromSql({
    targetVariable: collectorsPipelines,
    query: `
      SELECT [openCollectorUid]
        ,[pipelineUid]
        ,[state]
      FROM [dbo].[openCollectorsPipelines]
      `
  });

  await getDataFromSql({
    targetVariable: collectors,
    query: `
      SELECT [uid]
        ,[name]
        ,[hostname]
        ,[port]
        ,[authenticationMethod]
        ,[username]
        ,'** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **' AS [password]
        ,'** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **' AS [privateKey]
        ,[osVersion]
        ,[ocInstalled]
        ,[ocVersion]
        ,[fbInstalled]
        ,[fbVersion]
      FROM [dbo].[openCollectors]
      `
  });

  const collectorsPipelinesLooksGood = (
    collectorsPipelines
    && collectorsPipelines.payload
    && Array.isArray(collectorsPipelines.payload)
  );

  if (collectors && collectors.payload && Array.isArray(collectors.payload)) {
    collectors.payload
      .filter((collector) => collector.uid && collector.uid.length > 0)
      .forEach((collector) => {
        // Bring some values to their final boolean type
        /* eslint-disable no-param-reassign */
        collector.ocInstalled = (!!(collector.ocInstalled && collector.ocInstalled === 1));
        collector.fbInstalled = (!!(collector.fbInstalled && collector.fbInstalled === 1));
        /* eslint-enable no-param-reassign */

        // Map the Collectors-Pipelines
        // eslint-disable-next-line no-param-reassign
        collector.pipelines = [];
        if (collectorsPipelinesLooksGood) {
          collectorsPipelines.payload.forEach((cp) => {
            if (
              cp.openCollectorUid
              && cp.openCollectorUid
              && cp.openCollectorUid.length > 0
              && cp.pipelineUid
              && cp.pipelineUid.length > 0
              && cp.openCollectorUid === collector.uid
            ) {
              collector.pipelines.push({
                uid: cp.pipelineUid,
                // In SQL `state` data is stored as integer.
                // Passing it back to boolean using:
                //   0: desabled
                //   1: enabled
                enabled: (!!(cp.state && cp.state === 1))
              });
            }
          });
        }
      });
  }

  res.json(collectors);
});

// ##########################################################################################
// GetPipelines
// ##########################################################################################

const pipelines = {};

router.get('/GetPipelines', async (req, res) => {
  await waitMilliseconds(2000);
  await getDataFromSql({
    targetVariable: pipelines,
    query: `
    SELECT p.[uid]
      ,p.[name]
      ,p.[status] AS [statusId]
      ,s.[name] AS [status]
      ,p.[primaryOpenCollector]
      ,p.[fieldsMappingJson]
      ,p.[collectionConfigJson]
  FROM [dbo].[pipelines] p
  LEFT JOIN [dbo].[states] s
    ON s.[id] = p.[status]
  `
  });

  if (pipelines && pipelines.payload && Array.isArray(pipelines.payload)) {
    pipelines.payload.forEach((pipeline) => {
      /* eslint-disable no-param-reassign */
      try {
        pipeline.fieldsMapping = JSON.parse((pipeline.fieldsMappingJson && pipeline.fieldsMappingJson.length > 0 ? pipeline.fieldsMappingJson : '{}'));
      } catch (error) {
        pipeline.fieldsMapping = {};
      }
      try {
        pipeline.collectionConfig = JSON.parse((pipeline.collectionConfigJson && pipeline.collectionConfigJson.length > 0 ? pipeline.fieldsMappingJson : '{}'));
      } catch (error) {
        pipeline.collectionConfig = {};
      }
      /* eslint-enable no-param-reassign */
    });
  }
  // JSON.parse(
  res.json(pipelines);
});

// ##########################################################################################
// UpdateCollector
// ##########################################################################################

const collectorToUpdate = {};

router.post('/UpdateCollector', async (req, res) => {
  await getDataFromSql({
    targetVariable: collectorToUpdate,
    query: `
    EXECUTE [dbo].[upsert_openCollector] 
       @uid
      ,@name
      ,@hostname
      ,@port
      ,@authenticationMethod
      ,@username
      ,@password
      ,@privateKey
      ,@osVersion
      ,@ocInstalled
      ,@ocVersion
      ,@fbInstalled
      ,@fbVersion
      ;
    `,
    variables: createSqlVariables(
      req,
      [
        { name: 'uid', type: 'NVarChar' },
        { name: 'name', type: 'NVarChar' },
        { name: 'hostname', type: 'NVarChar' },
        { name: 'port', type: 'Int' },
        { name: 'authenticationMethod', type: 'NVarChar' },
        { name: 'username', type: 'NVarChar' },
        { name: 'password', type: 'NVarChar' },
        { name: 'privateKey', type: 'NVarChar' },
        { name: 'osVersion', type: 'NVarChar' },
        { name: 'ocInstalled', type: 'TinyInt' },
        { name: 'ocVersion', type: 'NVarChar' },
        { name: 'fbInstalled', type: 'TinyInt' },
        { name: 'fbVersion', type: 'NVarChar' }
      ]
    )
  });

  res.json(collectorToUpdate);
});

// ##########################################################################################
// DeleteCollector
// ##########################################################################################

const collectorToDelete = {};

router.post('/DeleteCollector', async (req, res) => {
  await getDataFromSql({
    targetVariable: collectorToDelete,
    query: `
    DELETE FROM [dbo].[openCollectors]
      WHERE uid = @uid
      ;
    `,
    variables: createSqlVariables(
      req,
      [
        { name: 'uid', type: 'NVarChar' }
      ]
    )
  });

  res.json(collectorToDelete);
});

module.exports = router;
