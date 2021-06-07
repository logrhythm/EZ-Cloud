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

// For passwords and tokens cyphering
const secretPlaceholder = '** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **';
const { aesEncrypt, aesDecrypt } = require('../shared/crypto');

// console.log(aesEncrypt('Hello world'));

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

// // ##########################################################################################
// // getDataFromSql
// // #########
// // Utilitarian function to get the data from
// // SQL using parameters.query and dump it in the
// // parameters.targetVariable
// // ##########################################################################################

// async function getDataFromSql(parameters) {
//   let stillChecking = true;
//   if (parameters && parameters.query && parameters.query.length && parameters.targetVariable) {
//     const { targetVariable, query, variables } = parameters;
//     targetVariable.stillChecking = true;
//     targetVariable.errors = [];
//     targetVariable.outputs = [];
//     targetVariable.payload = [];

//     // Connect
//     const connection = new Connection(configSql);

//     // Connection event handler
//     connection.on('connect', (connectionError) => {
//       if (connectionError) {
//         targetVariable.errors.push('Connection to database failed');
//         targetVariable.stillChecking = false;
//         stillChecking = false;
//         // throw connectionError;
//       }

//       // Exec the query
//       const request = new Request(query, (err, rowCount) => {
//         if (err) {
//           targetVariable.errors.push(err);
//         }
//         if (rowCount) {
//           targetVariable.outputs.push(`${rowCount} row(s) returned`);
//         }
//         targetVariable.stillChecking = false;
//         stillChecking = false;
//       });

//       if (variables && Array.isArray(variables)) {
//         variables.forEach((variable) => {
//           if (variable.name && variable.name.length > 0) {
//             // request.addParameter(variable.name, TYPES[variable.type], (variable.value || null));
//             request.addParameter(
//               variable.name,
//               TYPES[variable.type],
//               (
//                 // eslint-disable-next-line no-nested-ternary
//                 variable.value !== undefined
//                   ? (
//                     typeof variable.value === 'object'
//                       ? JSON.stringify(variable.value)
//                       : variable.value
//                   )
//                   : null
//               )
//             );
//             // if (typeof variable.value === 'string') {
//             //   request.addParameter(variable.name, TYPES.NVarChar, (variable.value || null));
//             // }
//             // if (typeof variable.value === 'number') {
//             //   request.addParameter(variable.name, TYPES.Int, (variable.value || null));
//             // }
//             // if (typeof variable.value === 'boolean') {
//             //   request.addParameter(variable.name, TYPES.TinyInt, (variable.value > 0));
//             // }
//             // if (variable.value === null) {
//             //   request.addParameter(variable.name, TYPES.Null, null);
//             // }
//           }
//         });
//       }

//       request.on('row', (columns) => {
//         // Make sure targetVariable.payload is an array
//         if (!targetVariable.payload || targetVariable.payload === null) {
//           targetVariable.payload = [];
//         }

//         // Compile the row using all its columns
//         const row = {};
//         columns.forEach((column) => {
//           row[column.metadata.colName] = column.value;
//         });
//         targetVariable.payload.push(row);
//       });

//       // And run it
//       connection.execSql(request);
//     });

//     // Kick it all off!
//     connection.connect();

//     // Wait, by default, for the query to happen (or fail) before returning to caller
//     if (!parameters.noWait) {
//       const loopEndTime = Date.now() / 1000 + maxCheckInterval;

//       // Waiting - Sync
//       while (targetVariable.stillChecking && (loopEndTime > (Date.now() / 1000))) {
//         // Wait for 50 ms
//         // eslint-disable-next-line no-await-in-loop
//         await waitMilliseconds(50);
//       }
//       if (stillChecking || targetVariable.stillChecking) {
//         targetVariable.errors.push('Timeout');
//       }
//       targetVariable.stillChecking = false;
//       stillChecking = false;
//     }
//   }
// }

// // ##########################################################################################
// // createSqlVariables
// // #########
// // Utilitarian function to create the array of
// // fields type mapping to be provided to
// // getDataFromSql as parameters.targetVariable
// // ##########################################################################################

// function createSqlVariables(req, definitions) {
//   const variables = [];
//   if (req && (req.query || req.body) && definitions && Array.isArray(definitions)) {
//     definitions.filter((def) => def.name && def.type && def.name.length && def.type.length)
//       .forEach((def) => {
//         variables.push({
//           name: def.name,
//           type: def.type,
//           /* eslint-disable no-nested-ternary */
//           value: (
//             req.body[def.name] !== undefined
//               ? req.body[def.name]
//               : (
//                 req.query[def.name] !== undefined
//                   ? req.query[def.name]
//                   : null
//               )
//           )
//           /* eslint-enable no-nested-ternary */
//         });
//       });
//   }
//   return variables;
// }

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

async function getSshConfigForCollector(params) {
  const sshConfig = {
    host: '',
    port: 22
  };
  const queryResult = {};

  if (params && params.uid && params.uid.length) {
    // console.log('**** getDataFromSql - GO...');
    await getDataFromSql({
      targetVariable: queryResult,
      query: `
      SELECT TOP 1
        [uid]
        ,[hostname]
        ,[port]
        ,[authenticationMethod]
        ,[username]
        ,[password]
        ,[privateKey]
      FROM [dbo].[openCollectors]
      WHERE [uid] = @uid
      ;
      `,
      variables: createSqlVariables(
        {
          body: {
            uid: params.uid
          }
        },
        [
          { name: 'uid', type: 'NVarChar' }
        ]
      )
    });

    // console.log('**** getDataFromSql - DONE.');
    // console.log('**** queryResult:');
    // console.log(queryResult);

    // {
    //   stillChecking: false,
    //   errors: [],
    //   outputs: [ '1 row(s) returned' ],
    //   payload: [
    //     {
    //       uid: 'dd666d77-c301-4717-b62a-059accbf7b37',
    //       hostname: 'pass',
    //       port: 22,
    //       authenticationMethod: 'password',
    //       username: 'sa',
    //       password: 'U2FsdGVkX19tHAMWZl15RqL5IuuFk0dIMDK5rE7rAPg=',
    //       privateKey: 'null'
    //     }
    //   ]
    // }

    const collectorRecord = (
      queryResult
      && Array.isArray(queryResult.payload)
      && queryResult.payload.length
        ? queryResult.payload[0]
        : null
    );

    // console.log('**** collectorRecord:');
    // console.log(collectorRecord);

    if (
      collectorRecord
      && collectorRecord.hostname
      && collectorRecord.hostname.length
      && collectorRecord.port
      && collectorRecord.port > 0
      && collectorRecord.port < 65536
      && collectorRecord.authenticationMethod
      && collectorRecord.authenticationMethod.length
      && (
        (
          collectorRecord.password
          && collectorRecord.password.length
        )
        || (
          collectorRecord.privateKey
          && collectorRecord.privateKey.length
        )
      )
    ) {
      // Valid record
      // console.log('****    --> Valid record');
      sshConfig.host = collectorRecord.hostname;
      sshConfig.port = collectorRecord.port;
      sshConfig.user = (
        collectorRecord.username
        && collectorRecord.username.length
        && collectorRecord.username !== null
          ? collectorRecord.username
          : undefined
      );
      sshConfig.pass = (
        collectorRecord.password
        && collectorRecord.password.length
        && collectorRecord.password !== null
          ? aesDecrypt(collectorRecord.password)
          : undefined
      );
      sshConfig.key = (
        collectorRecord.privateKey
        && collectorRecord.privateKey.length
        && collectorRecord.privateKey !== null
          ? aesDecrypt(collectorRecord.privateKey)
          : undefined
      );
    }
  }
  return sshConfig;
}

async function getCollectorSshConfigForPipeline(params) {
  const queryResult = {};
  let collectorUid = '';

  if (params && params.uid && params.uid.length) {
    await getDataFromSql({
      targetVariable: queryResult,
      query: `
      SELECT TOP 1 [primaryOpenCollector]
      FROM [dbo].[pipelines]
      WHERE [uid] = @uid
      ;
      `,
      variables: createSqlVariables(
        {
          body: {
            uid: params.uid
          }
        },
        [
          { name: 'uid', type: 'NVarChar' }
        ]
      )
    });

    const pipelineRecord = (
      queryResult
      && Array.isArray(queryResult.payload)
      && queryResult.payload.length
        ? queryResult.payload[0]
        : null
    );

    if (
      pipelineRecord
      && pipelineRecord.primaryOpenCollector
      && pipelineRecord.primaryOpenCollector.length
    ) {
      // Valid record
      collectorUid = pipelineRecord.primaryOpenCollector;
    }
  }
  return getSshConfigForCollector({ uid: collectorUid });
}

module.exports = {
  config: router,
  getSshConfigForCollector,
  getCollectorSshConfigForPipeline
};
