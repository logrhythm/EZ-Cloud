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
