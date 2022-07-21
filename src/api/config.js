const express = require('express');

const router = express.Router();
// // Get SQL config
// const fs = require('fs');
// const path = require('path');

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

// const { getConfigDataFromSql, createMsSqlVariables } = require('../shared/sqlUtils'); // XXXX
const {
  getDataFromMsSql,
  createMsSqlVariables,
  // createMsSqlVariablesAndStoredProcParams,
  getDataFromPgSql,
  createPgSqlVariables
} = require('../shared/sqlUtils');

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
  if (
    process.env.databaseMode === 'mssql'
  ) {
    // Use MS SQL
    await getDataFromMsSql({
      targetVariable: collectorsPipelines,
      query: `
      SELECT [openCollectorUid]
        ,[pipelineUid]
        ,[state]
      FROM [dbo].[openCollectorsPipelines]
      ;
      `
    });

    await getDataFromMsSql({
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
          ,[installedShippers]
        FROM [dbo].[openCollectors]
        `
    });
  } else {
    // Use PgSQL
    await getDataFromPgSql({
      targetVariable: collectorsPipelines,
      query: `
      SELECT "openCollectorUid"
        ,"pipelineUid"
        ,"state"
      FROM "openCollectorsPipelines"
      ;
    `
    });

    await getDataFromPgSql({
      targetVariable: collectors,
      query: `
      SELECT "uid"
          ,"name"
          ,"hostname"
          ,"port"
          ,"authenticationMethod"
          ,"username"
          ,'** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **' AS "password"
          ,'** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **' AS "privateKey"
          ,"osVersion"
          ,CASE
          WHEN
              "openCollectors"."ocInstalled"=TRUE
              THEN 1
          ELSE
              0
          END AS "ocInstalled"
          ,"ocVersion"
          ,CASE
            WHEN
                "openCollectors"."fbInstalled"=TRUE
                THEN 1
            ELSE
                0
            END AS "fbInstalled"
          ,"fbVersion"
          ,"installedShippers"
        FROM "openCollectors"
      ;
    `
    });
  }

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

        // Parse the list of Shippers, falling back to an empty array if things go pear shaped.
        try {
          // eslint-disable-next-line no-param-reassign
          collector.installedShippers = JSON.parse(collector.installedShippers);
        } catch (error) {
          // eslint-disable-next-line no-param-reassign
          collector.installedShippers = [];
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
  if (
    process.env.databaseMode === 'mssql'
  ) {
    // Use MS SQL
    await getDataFromMsSql({
      targetVariable: pipelines,
      query: `
      SELECT p.[uid]
        ,p.[name]
        ,p.[status] AS [statusId]
        ,s.[name] AS [status]
        ,p.[primaryOpenCollector]
        ,p.[fieldsMappingJson]
        ,p.[collectionConfigJson]
        ,p.[optionsJson]
      FROM [dbo].[pipelines] p
      LEFT JOIN [dbo].[states] s
        ON s.[id] = p.[status]
      `
    });
  } else {
    // Use PgSQL
    await getDataFromPgSql({
      targetVariable: pipelines,
      query: `
      SELECT p."uid"
        ,p."name"
        ,p."status" AS "statusId"
        ,s."name" AS "status"
        ,p."primaryOpenCollector"
        ,p."fieldsMappingJson"
        ,p."collectionConfigJson"
        ,p."optionsJson"
      FROM "pipelines" p
      LEFT JOIN "states" s
        ON s."id" = p."status"
    `
    });
  }

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
      try {
        pipeline.options = JSON.parse((pipeline.optionsJson && pipeline.optionsJson.length > 0 ? pipeline.optionsJson : '{}'));
        delete pipeline.optionsJson;
      } catch (error) {
        pipeline.options = {};
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

  if (
    process.env.databaseMode === 'mssql'
  ) {
    // Use MS SQL
    await getDataFromMsSql({
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
        ,@installedShippers
      ;
      `,
      variables: createMsSqlVariables(
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
          { name: 'pipelines', type: 'NVarChar' },
          { name: 'installedShippers', type: 'NVarChar' }
        ]
      )
    });
  } else {
    // Use PgSQL
    await getDataFromPgSql({
      targetVariable: collectorToUpdate,
      query: `
      CALL "upsert_openCollector"
      (
         $1 -- @uid
        ,$2 -- @name
        ,$3 -- @hostname
        ,$4 -- @port
        ,$5 -- @authenticationMethod
        ,$6 -- @username
        ,$7 -- @password
        ,$8 -- @privateKey
        ,$9 -- @osVersion
        ,$10 -- @ocInstalled
        ,$11 -- @ocVersion
        ,$12 -- @fbInstalled
        ,$13 -- @fbVersion
        ,$14 -- @pipelines
        ,$15 -- @installedShippers
      );
      `,
      variables: createPgSqlVariables(
        myReq,
        [
          { name: 'uid' },
          { name: 'name' },
          { name: 'hostname' },
          { name: 'port' },
          { name: 'authenticationMethod' },
          { name: 'username' },
          { name: 'password' },
          { name: 'privateKey' },
          { name: 'osVersion' },
          { name: 'ocInstalled' },
          { name: 'ocVersion' },
          { name: 'fbInstalled' },
          { name: 'fbVersion' },
          { name: 'pipelines' },
          { name: 'installedShippers' }
        ]
      )
    });
  }

  res.json(collectorToUpdate);
});

// ##########################################################################################
// DeleteCollector
// ##########################################################################################

const collectorToDelete = {};

router.post('/DeleteCollector', async (req, res) => {
  if (
    process.env.databaseMode === 'mssql'
  ) {
    // Use MS SQL
    await getDataFromMsSql({
      targetVariable: collectorToDelete,
      query: `
      DELETE FROM [dbo].[openCollectors]
        WHERE uid = @uid
      ;
      `,
      variables: createMsSqlVariables(
        req,
        [
          { name: 'uid', type: 'NVarChar' }
        ]
      )
    });
  } else {
    // Use PgSQL
    await getDataFromPgSql({
      targetVariable: collectorToDelete,
      query: `
      DELETE FROM "openCollectors"
        WHERE uid = $1
      ;
      `,
      variables: createPgSqlVariables(
        req,
        [
          { name: 'uid' }
        ]
      )
    });
  }

  res.json(collectorToDelete);
});

// ##########################################################################################
// UpdatePipeline
// ##########################################################################################

const pipelineToUpdate = {};

router.post('/UpdatePipeline', async (req, res) => {
  if (
    process.env.databaseMode === 'mssql'
  ) {
    // Use MS SQL
    await getDataFromMsSql({
      targetVariable: pipelineToUpdate,
      query: `
      EXECUTE [dbo].[upsert_Pipeline] 
        @uid
        ,@name
        ,@status
        ,@primaryOpenCollector
        ,@fieldsMapping
        ,@collectionConfig
        ,@options
      ;
      `,
      variables: createMsSqlVariables(
        req,
        [
          { name: 'uid', type: 'NVarChar' },
          { name: 'name', type: 'NVarChar' },
          { name: 'status', type: 'NVarChar' },
          { name: 'primaryOpenCollector', type: 'NVarChar' },
          { name: 'fieldsMapping', type: 'NVarChar' },
          { name: 'collectionConfig', type: 'NVarChar' },
          { name: 'options', type: 'NVarChar' }
        ]
      )
    });
  } else {
    // Use PgSQL
    await getDataFromPgSql({
      targetVariable: pipelineToUpdate,
      query: `
      CALL "upsert_Pipeline"
      (
         $1 -- uid
        ,$2 -- name
        ,$3 -- status
        ,$4 -- primaryOpenCollector
        ,$5 -- fieldsMapping
        ,$6 -- collectionConfig
        ,$7 -- options
      )
      ;
      `,
      variables: createPgSqlVariables(
        req,
        [
          { name: 'uid' },
          { name: 'name' },
          { name: 'status' },
          { name: 'primaryOpenCollector' },
          { name: 'fieldsMapping' },
          { name: 'collectionConfig' },
          { name: 'options' }
        ]
      )
    });
  }

  res.json(pipelineToUpdate);
});

// ##########################################################################################
// DeletePipeline
// ##########################################################################################

const pipelineToDelete = {};

router.post('/DeletePipeline', async (req, res) => {
  if (
    process.env.databaseMode === 'mssql'
  ) {
    // Use MS SQL
    await getDataFromMsSql({
      targetVariable: pipelineToDelete,
      query: `
      DELETE FROM [dbo].[pipelines]
        WHERE uid = @uid
      ;
      `,
      variables: createMsSqlVariables(
        req,
        [
          { name: 'uid', type: 'NVarChar' }
        ]
      )
    });
  } else {
    // Use PgSQL
    await getDataFromPgSql({
      targetVariable: pipelineToDelete,
      query: `
      DELETE FROM "pipelines"
        WHERE uid = $1
      ;
      `,
      variables: createPgSqlVariables(
        req,
        [
          { name: 'uid' }
        ]
      )
    });
  }

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
