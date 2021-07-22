const express = require('express');

const router = express.Router();
// Get SQL config
const fs = require('fs');
const path = require('path');

const configSql = JSON.parse(fs.readFileSync(path.join(process.env.baseDirname, 'config', 'database.json'), 'utf8')).config;
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

// For passwords and tokens cyphering
const secretPlaceholder = '** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **';
const { aesEncrypt } = require('../shared/crypto');

router.get('/', (req, res) => {
  res.json({
    message: 'API - Config - All good'
  });
});

//        ##     ## ######## #### ##       #### ######## #### ########  ######
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ######    ######
//        ##     ##    ##     ##  ##        ##     ##     ##  ##             ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//         #######     ##    #### ######## ####    ##    #### ########  ######

const { getDataFromSql, createSqlVariables } = require('../shared/sqlUtils');

//        ########   #######  ##     ## ######## ########  ######
//        ##     ## ##     ## ##     ##    ##    ##       ##    ##
//        ##     ## ##     ## ##     ##    ##    ##       ##
//        ########  ##     ## ##     ##    ##    ######    ######
//        ##   ##   ##     ## ##     ##    ##    ##             ##
//        ##    ##  ##     ## ##     ##    ##    ##       ##    ##
//        ##     ##  #######   #######     ##    ########  ######

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
        pipeline.fieldsMapping = JSON.parse((pipeline.fieldsMappingJson && pipeline.fieldsMappingJson.length > 0 ? pipeline.fieldsMappingJson : '[]'));
        delete pipeline.fieldsMappingJson;
      } catch (error) {
        pipeline.fieldsMapping = {};
      }
      try {
        pipeline.collectionConfig = JSON.parse((pipeline.collectionConfigJson && pipeline.collectionConfigJson.length > 0 ? pipeline.collectionConfigJson : '{}'));
        delete pipeline.collectionConfigJson;
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
  // Make a safe copy (so our changes don't mess up the original req object)
  const myReq = {
    body: JSON.parse(JSON.stringify(req.body || {}))
  };
  if (myReq.body.password && myReq.body.password !== secretPlaceholder) {
    myReq.body.password = aesEncrypt(myReq.body.password);
  }
  if (myReq.body.privateKey && myReq.body.privateKey !== secretPlaceholder) {
    myReq.body.privateKey = aesEncrypt(myReq.body.privateKey);
  }

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
      ,@pipelines
      ;
    `,
    variables: createSqlVariables(
      myReq,
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
        { name: 'fbVersion', type: 'NVarChar' },
        { name: 'pipelines', type: 'NVarChar' }
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

// ##########################################################################################
// UpdatePipeline
// ##########################################################################################

const pipelineToUpdate = {};

router.post('/UpdatePipeline', async (req, res) => {
  await getDataFromSql({
    targetVariable: pipelineToUpdate,
    query: `
    EXECUTE [dbo].[upsert_Pipeline] 
       @uid
      ,@name
      ,@status
      ,@primaryOpenCollector
      ,@fieldsMapping
      ,@collectionConfig
      ;
    `,
    variables: createSqlVariables(
      req,
      [
        { name: 'uid', type: 'NVarChar' },
        { name: 'name', type: 'NVarChar' },
        { name: 'status', type: 'NVarChar' },
        { name: 'primaryOpenCollector', type: 'NVarChar' },
        { name: 'fieldsMapping', type: 'NVarChar' },
        { name: 'collectionConfig', type: 'NVarChar' }
      ]
    )
  });

  res.json(pipelineToUpdate);
});

// ##########################################################################################
// DeletePipeline
// ##########################################################################################

const pipelineToDelete = {};

router.post('/DeletePipeline', async (req, res) => {
  await getDataFromSql({
    targetVariable: pipelineToDelete,
    query: `
    DELETE FROM [dbo].[pipelines]
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

  res.json(pipelineToDelete);
});

//        ######## ##     ## ########   #######  ########  ########  ######
//        ##        ##   ##  ##     ## ##     ## ##     ##    ##    ##    ##
//        ##         ## ##   ##     ## ##     ## ##     ##    ##    ##
//        ######      ###    ########  ##     ## ########     ##     ######
//        ##         ## ##   ##        ##     ## ##   ##      ##          ##
//        ##        ##   ##  ##        ##     ## ##    ##     ##    ##    ##
//        ######## ##     ## ##         #######  ##     ##    ##     ######

module.exports = {
  config: router
};
