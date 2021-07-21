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

router.get('/', (req, res) => {
  res.json({
    message: 'API - logrhythmCore - All good'
  });
});

//        ##     ## ######## #### ##       #### ######## #### ########  ######
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ######    ######
//        ##     ##    ##     ##  ##        ##     ##     ##  ##             ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//         #######     ##    #### ######## ####    ##    #### ########  ######

const {
  getDataFromSql,
  createSqlVariables,
  createSqlVariablesAndStoredProcParams
} = require('../shared/sqlUtils');

//        ########   #######  ##     ## ######## ########  ######
//        ##     ## ##     ## ##     ##    ##    ##       ##    ##
//        ##     ## ##     ## ##     ##    ##    ##       ##
//        ########  ##     ## ##     ##    ##    ######    ######
//        ##   ##   ##     ## ##     ##    ##    ##             ##
//        ##    ##  ##     ## ##     ##    ##    ##       ##    ##
//        ##     ##  #######   #######     ##    ########  ######

// ##########################################################################################
// UpdateLogSourceType
// ##########################################################################################

router.post('/UpdateLogSourceType', async (req, res) => {
  const updatedLogSourceType = {};

  await getDataFromSql({
    targetVariable: updatedLogSourceType,
    query: `
    EXECUTE [dbo].[upsert_LogSource_Type]
       @uid
      ,@name
      ;
    `,
    variables: createSqlVariables(
      req,
      [
        { name: 'uid', type: 'NVarChar' },
        { name: 'name', type: 'NVarChar' }
      ]
    )
  });

  res.json(updatedLogSourceType);
});

// ##########################################################################################
// UpdateMpeRule
// ##########################################################################################

router.post('/UpdateMpeRule', async (req, res) => {
  const updatedMpeRule = {};

  await getDataFromSql({
    targetVariable: updatedMpeRule,
    query: `
    EXECUTE [dbo].[clone_MPE_Rule]
       @uid
      ,@name
      ;
    `,
    variables: createSqlVariables(
      req,
      [
        { name: 'uid', type: 'NVarChar' },
        { name: 'name', type: 'NVarChar' }
      ]
    )
  });

  res.json(updatedMpeRule);
});

// ##########################################################################################
// UpdateMpeSubRule
// ##########################################################################################

router.post('/UpdateMpeSubRule', async (req, res) => {
  const updatedMpeSubRule = {};

  // Create the SQL Variables and the Stored Procedure parameters in one go, while weeding out the missing params
  const [ sqlVariables, storedProcedureParams ] = createSqlVariablesAndStoredProcParams(
    req,
    [
      { name: 'uid', type: 'NVarChar' },
      { name: 'SubRuleUid', type: 'NVarChar' }, // (40),
      { name: 'SubRuleName', type: 'NVarChar' }, // (50),
      { name: 'TargetCommonEventID', type: 'Int' }, //  = 1029941, --Information // Generic Record
      { name: 'TargetRuleStatus', type: 'Int' }, //  = 2, --Test
      { name: 'ForwardAsEvent', type: 'Int' }, //  = 0, --0 Not an Event, 1 Is an event
      { name: 'Tag1', type: 'NVarChar' }, // (200) = '*',
      { name: 'Tag2', type: 'NVarChar' }, // (200) = '*',
      { name: 'Tag3', type: 'NVarChar' }, // (200) = '*',
      { name: 'Tag4', type: 'NVarChar' }, // (200) = '*',
      { name: 'Tag5', type: 'NVarChar' }, // (200) = '*',
      { name: 'Tag6', type: 'NVarChar' }, // (200) = '*',
      { name: 'Tag7', type: 'NVarChar' }, // (200) = '*',
      { name: 'Tag8', type: 'NVarChar' }, // (200) = '*',
      { name: 'Tag9', type: 'NVarChar' }, // (200) = '*',
      { name: 'Tag10', type: 'NVarChar' } // (200) = '*'
    ],
    true // Weed stuff out
  )

  // Ship it to SQL
  await getDataFromSql({
    targetVariable: updatedMpeSubRule,
    query: `
    EXECUTE [dbo].[upsert_MPE_SubRule]
       ${storedProcedureParams.join(', ')}
      ;
    `,
    variables: sqlVariables
  });

  res.json(updatedMpeSubRule);
});

// ##########################################################################################
// UpdateProcessingPolicy
// ##########################################################################################

router.post('/UpdateProcessingPolicy', async (req, res) => {
  const updatedProcessingPolicy = {};

  // Create the SQL Variables and the Stored Procedure parameters in one go, while weeding out the missing params
  const [ sqlVariables, storedProcedureParams ] = createSqlVariablesAndStoredProcParams(
    req,
    [
      { name: 'uid', type: 'NVarChar' }, // (40)
      { name: 'name', type: 'NVarChar' }, // (50)
      { name: 'MPEPolicy_Name', type: 'NVarChar' } // (50) -- 'LogRhythm Default' -- Name of the new Policy (if Policy already exists, old name is kept)
    ],
    true // Weed stuff out
  )

  // Ship it to SQL
  await getDataFromSql({
    targetVariable: updatedProcessingPolicy,
    query: `
    EXECUTE [dbo].[upsert_Processing_Policy]
       ${storedProcedureParams.join(', ')}
      ;
    `,
    variables: sqlVariables
  });

  res.json(updatedProcessingPolicy);
});

// ##########################################################################################
// UpdateLogSourceVirtualisationTemplate
// ##########################################################################################

router.post('/UpdateLogSourceVirtualisationTemplate', async (req, res) => {
  const updatedLogSourceVirtualisationTemplate = {};

  // Create the SQL Variables and the Stored Procedure parameters in one go, while weeding out the missing params
  const [ sqlVariables, storedProcedureParams ] = createSqlVariablesAndStoredProcParams(
    req,
    [
      { name: 'Virt_Template_UID', type: 'NVarChar' }, // (40) Default to '0d7544aa-5760-4c5e-be62-26262f3cd1db', --UID of the EZ Cloud Template
      { name: 'Virt_Template_Name', type: 'NVarChar' }, // (50) Default to 'EZ Cloud', --Name of the new Template
      { name: 'ItemToInsert_ID', type: 'Int' }, // NULL, --ID of Template Item to insert, or NULL if none
      { name: 'ItemToInsert_SortOrder', type: 'Int' }, // Default to NULL, --SortOrder of the Template Item to insert, or NULL if none or happy to get the Max + 1
      { name: 'ItemToDelete_ID', type: 'Int' } // Default to NULL -- ID of Template Item to delete, or NULL if none
    ],
    true // Weed stuff out
  )

  // Ship it to SQL
  await getDataFromSql({
    targetVariable: updatedLogSourceVirtualisationTemplate,
    query: `
    EXECUTE [dbo].[upsert_Log_Source_Virtualisation_Template]
       ${storedProcedureParams.join(', ')}
      ;
    `,
    variables: sqlVariables
  });

  res.json(updatedLogSourceVirtualisationTemplate);
});

// ##########################################################################################
// UpdateLogSourceVirtualisationTemplateItem
// ##########################################################################################

router.post('/UpdateLogSourceVirtualisationTemplateItem', async (req, res) => {
  const updatedLogSourceVirtualisationTemplateItem = {};

  // Create the SQL Variables and the Stored Procedure parameters in one go, while weeding out the missing params
  const [ sqlVariables, storedProcedureParams ] = createSqlVariablesAndStoredProcParams(
    req,
    [
      { name: 'uid', type: 'NVarChar' }, // (40) UID of the Log Source
      { name: 'name', type: 'NVarChar' }, // (50) Name of Log Source
      { name: 'RegexFilter', type: 'NVarChar' }, // Default to NULL, If not provided, we build it up from UID and Name
      { name: 'MPEProcessingPolicyID', type: 'Int' } // Default to NULL, If not provided, we look for it
    ],
    true // Weed stuff out
  )

  // Ship it to SQL
  await getDataFromSql({
    targetVariable: updatedLogSourceVirtualisationTemplateItem,
    query: `
    EXECUTE [dbo].[upsert_Log_Source_Virtualisation_Template_Item]
       ${storedProcedureParams.join(', ')}
      ;
    `,
    variables: sqlVariables
  });

  res.json(updatedLogSourceVirtualisationTemplateItem);
});

// ##########################################################################################
// GetOpenCollectorLogSourcesList
// ##########################################################################################


router.get('/GetOpenCollectorLogSourcesList', async (req, res) => {
  const openCollectorLogSourcesList = {};
  await getDataFromSql({
    targetVariable: openCollectorLogSourcesList,
    query: `
    SELECT TOP (1000) [MsgSourceID] AS 'msgSourceID'
      ,[SystemMonitorID] AS 'systemMonitorID'
      ,[Status] AS 'status'
      ,[MsgSourceTypeID] AS 'msgSourceTypeID'
      ,[Name] AS 'name'
      ,[ShortDesc] AS 'shortDesc'
      ,[LongDesc] AS 'longDesc'
      ,[IsVirtual] AS 'isVirtual'
      ,[DateUpdated] AS 'dateUpdated'
      ,[HostID] AS 'hostID'
      ,[HostName] AS 'hostName'
      ,[HostIdentifiers_JSON] AS 'hostIdentifiers_JSON'
    FROM [EZ].[dbo].[list_OpenCollector_Log_Sources]
  `
  });

  if (openCollectorLogSourcesList && openCollectorLogSourcesList.payload && Array.isArray(openCollectorLogSourcesList.payload)) {
    openCollectorLogSourcesList.payload.forEach((openCollectorLogSource) => {
      /* eslint-disable no-param-reassign */
      try {
        openCollectorLogSource.hostIdentifiers = JSON.parse((openCollectorLogSource.hostIdentifiers_JSON && openCollectorLogSource.hostIdentifiers_JSON.length > 0 ? openCollectorLogSource.hostIdentifiers_JSON : '[]'));
        delete openCollectorLogSource.hostIdentifiers_JSON;
      } catch (error) {
        openCollectorLogSource.hostIdentifiers = {};
      }
      /* eslint-enable no-param-reassign */
    });
  }
  res.json(openCollectorLogSourcesList);
});

//        ######## ##     ## ########   #######  ########  ########  ######
//        ##        ##   ##  ##     ## ##     ## ##     ##    ##    ##    ##
//        ##         ## ##   ##     ## ##     ## ##     ##    ##    ##
//        ######      ###    ########  ##     ## ########     ##     ######
//        ##         ## ##   ##        ##     ## ##   ##      ##          ##
//        ##        ##   ##  ##        ##     ## ##    ##     ##    ##    ##
//        ######## ##     ## ##         #######  ##     ##    ##     ######

module.exports = {
  logrhythmCore: router
};
