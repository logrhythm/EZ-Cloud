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

const { getDataFromSql, createSqlVariables } = require('../shared/sqlUtils');

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
  // Prep SQL Variabled
  const sqlVariablesRaw = createSqlVariables(
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
    ]
  );

  // Weed out all the ones with NULL or Undefined
  // This is done as the SQL Stored Procedure will use default values if a param is not provided
  // But by default, createSqlVariables() puts NULL, and that's no good

  const storedProcedureParams = [];
  const sqlVariables = []

  sqlVariablesRaw.forEach((variable) => {
    if (variable.value !== undefined && variable.value !== null) {
      sqlVariables.push(variable);
      storedProcedureParams.push(`@${variable.name} = @${variable.name}`)
    }
  })

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
