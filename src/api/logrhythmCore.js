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
  const updatedProcessingPolicy = {};

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
    targetVariable: updatedProcessingPolicy,
    query: `
    EXECUTE [dbo].[upsert_Log_Source_Virtualisation_Template]
       ${storedProcedureParams.join(', ')}
      ;
    `,
    variables: sqlVariables
  });

  res.json(updatedProcessingPolicy);
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
