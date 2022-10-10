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

// Load the System Logging functions
const { logToSystem } = require('../shared/systemLogging');

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
  getSiemDataFromSql, // OBSOLETE. MUST STOP USING. XXXX
  getDataFromMsSql,
  createMsSqlVariables,
  createMsSqlVariablesAndStoredProcParams
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

  await getSiemDataFromSql({
    targetVariable: updatedLogSourceType,
    query: `
    EXECUTE [dbo].[OC_Admin_Upsert_LogSource_Type]
       @uid
      ,@name
      ;
    `,
    variables: createMsSqlVariables(
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

  await getSiemDataFromSql({
    targetVariable: updatedMpeRule,
    query: `
    EXECUTE [dbo].[OC_Admin_Clone_MPE_Rule]
       @uid
      ,@name
      ;
    `,
    variables: createMsSqlVariables(
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
  const [sqlVariables, storedProcedureParams] = createMsSqlVariablesAndStoredProcParams(
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
  );

  // Ship it to SQL
  await getSiemDataFromSql({
    targetVariable: updatedMpeSubRule,
    query: `
    EXECUTE [dbo].[OC_Admin_Upsert_MPE_SubRule]
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
  const [sqlVariables, storedProcedureParams] = createMsSqlVariablesAndStoredProcParams(
    req,
    [
      { name: 'uid', type: 'NVarChar' }, // (40)
      { name: 'name', type: 'NVarChar' }, // (50)
      { name: 'MPEPolicy_Name', type: 'NVarChar' } // (50) -- 'LogRhythm Default' -- Name of the new Policy (if Policy already exists, old name is kept)
    ],
    true // Weed stuff out
  );

  // Ship it to SQL
  await getSiemDataFromSql({
    targetVariable: updatedProcessingPolicy,
    query: `
    EXECUTE [dbo].[OC_Admin_Upsert_Processing_Policy]
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
  const [sqlVariables, storedProcedureParams] = createMsSqlVariablesAndStoredProcParams(
    req,
    [
      { name: 'Virt_Template_UID', type: 'NVarChar' }, // (40) Default to '0d7544aa-5760-4c5e-be62-26262f3cd1db', --UID of the EZ Cloud Template
      { name: 'Virt_Template_Name', type: 'NVarChar' }, // (50) Default to 'EZ Cloud', --Name of the new Template
      { name: 'ItemToInsert_ID', type: 'Int' }, // NULL, --ID of Template Item to insert, or NULL if none
      { name: 'ItemToInsert_SortOrder', type: 'Int' }, // Default to NULL, --SortOrder of the Template Item to insert, or NULL if none or happy to get the Max + 1
      { name: 'ItemToDelete_ID', type: 'Int' } // Default to NULL -- ID of Template Item to delete, or NULL if none
    ],
    true // Weed stuff out
  );

  // Ship it to SQL
  await getSiemDataFromSql({
    targetVariable: updatedLogSourceVirtualisationTemplate,
    query: `
    EXECUTE [dbo].[OC_Admin_Upsert_Log_Source_Virtualisation_Template]
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
  const [sqlVariables, storedProcedureParams] = createMsSqlVariablesAndStoredProcParams(
    req,
    [
      { name: 'uid', type: 'NVarChar' }, // (40) UID of the Log Source
      { name: 'name', type: 'NVarChar' }, // (50) Name of Log Source
      { name: 'RegexFilter', type: 'NVarChar' }, // Default to NULL, If not provided, we build it up from UID and Name
      { name: 'MPEProcessingPolicyID', type: 'Int' } // Default to NULL, If not provided, we look for it
    ],
    true // Weed stuff out
  );

  // Ship it to SQL
  await getSiemDataFromSql({
    targetVariable: updatedLogSourceVirtualisationTemplateItem,
    query: `
    EXECUTE [dbo].[OC_Admin_Upsert_Log_Source_Virtualisation_Template_Item]
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
  await getSiemDataFromSql({
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
    FROM [EZ].[dbo].[OC_Admin_List_OpenCollector_Log_Sources]
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
    logToSystem('Debug', JSON.stringify(openCollectorLogSourcesList), true);
  }
  res.json(openCollectorLogSourcesList);
});

// ##########################################################################################
// UpdateOpenCollectorLogSourceWithLogSourceVirtualisation
// ##########################################################################################

router.post('/UpdateOpenCollectorLogSourceWithLogSourceVirtualisation', async (req, res) => {
  const updatedOpenCollectorLogSource = {};

  // Create the SQL Variables and the Stored Procedure parameters in one go, while weeding out the missing params
  const [sqlVariables, storedProcedureParams] = createMsSqlVariablesAndStoredProcParams(
    req,
    [
      { name: 'uid', type: 'NVarChar' }, // (40) UID of the Log Source
      { name: 'OpenCollectorMotherLogSourceID', type: 'Int' }, // Log Source ID of the Open Collector
      { name: 'Virt_Template_UID', type: 'NVarChar' } // (40) Default to '0d7544aa-5760-4c5e-be62-26262f3cd1db', -- UID of the EZ Cloud Template
    ],
    true // Weed stuff out
  );

  // Ship it to SQL
  await getSiemDataFromSql({
    targetVariable: updatedOpenCollectorLogSource,
    query: `
    EXECUTE [dbo].[OC_Admin_Upsert_Log_Source_Virtualisation_To_OpenCollector_LogSource]
       ${storedProcedureParams.join(', ')}
      ;
    `,
    variables: sqlVariables
  });

  res.json(updatedOpenCollectorLogSource);
});

// ##########################################################################################
// GetSiemDatabaseStatusAndVersions
// ##########################################################################################

router.get('/GetSiemDatabaseStatusAndVersions', async (req, res) => {
  // Steps
  // Check presence of:
  // - SQL server
  // - OC Admin DB
  // - get_EZ_Versions
  // - SP & Views in the right version

  const siemDatabaseStatusAndStatusAndVersions = {
    sqlServerIsUp: false,
    sqlServerVersion: null,
    ezDatabaseExists: false,
    ezDatabaseStatus: null,
    viewGet_EZ_VersionsExists: false,
    viewGet_EZ_VersionsDetails: null,
    storedProcedureAndViewsVersions: []
  };

  if (
    process.env.databaseMode === 'mssql'
    || process.env.databaseMode === 'split'
  ) {
    logToSystem('Verbose', 'Fetching the version number of the MS SQL of the XM or PM...');

    // Check SQL Server presence and response
    const sqlServerVersionList = {};
    await getDataFromMsSql({
      targetVariable: sqlServerVersionList,
      query: `
      SELECT @@version AS 'sqlVersion';
    `
    });

    if (
      sqlServerVersionList
      && sqlServerVersionList.payload
      && Array.isArray(sqlServerVersionList.payload)
      && sqlServerVersionList.payload.length > 0
    ) {
      siemDatabaseStatusAndStatusAndVersions.sqlServerIsUp = !!(
        sqlServerVersionList.payload[0].sqlVersion
        && String(sqlServerVersionList.payload[0].sqlVersion).length
      );
      // eslint-disable-next-line max-len
      siemDatabaseStatusAndStatusAndVersions.sqlServerVersion = sqlServerVersionList.payload[0].sqlVersion;
    }
  }

  // Check `EZ` DATABASE exists
  if (siemDatabaseStatusAndStatusAndVersions.sqlServerIsUp) {
    // Check SQL Server presence and response
    const ezDbStatusList = {};
    await getDataFromMsSql({
      targetVariable: ezDbStatusList,
      query: `
      SELECT TOP (1)
        [name] AS 'name',
        [create_date] AS 'createdOn',
        [state_desc] AS 'status'
      FROM
        [sys].[databases]
      WHERE name = 'EZ'
      ;
    `
    });

    if (
      ezDbStatusList
      && ezDbStatusList.payload
      && Array.isArray(ezDbStatusList.payload)
      && ezDbStatusList.payload.length === 1
    ) {
      siemDatabaseStatusAndStatusAndVersions.ezDatabaseExists = true;
      // eslint-disable-next-line max-len, prefer-destructuring
      siemDatabaseStatusAndStatusAndVersions.ezDatabaseStatus = ezDbStatusList.payload[0];
    }
  }

  // Check `get_EZ_Versions` VIEW exists
  if (siemDatabaseStatusAndStatusAndVersions.ezDatabaseExists) {
    const viewGet_EZ_VersionsList = {};
    await getDataFromMsSql({
      targetVariable: viewGet_EZ_VersionsList,
      query: `
      SELECT TOP (1)
        [name] AS 'name',
        [create_date] AS 'createdOn',
        [modify_date] AS 'updatedOn'
      FROM
        [EZ].[sys].[all_objects]
      WHERE
        [name] = 'get_EZ_Versions'
      ;
    `
    });

    if (
      viewGet_EZ_VersionsList
      && viewGet_EZ_VersionsList.payload
      && Array.isArray(viewGet_EZ_VersionsList.payload)
      && viewGet_EZ_VersionsList.payload.length === 1
    ) {
      siemDatabaseStatusAndStatusAndVersions.viewGet_EZ_VersionsExists = true;
      // eslint-disable-next-line max-len, prefer-destructuring
      siemDatabaseStatusAndStatusAndVersions.viewGet_EZ_VersionsDetails = viewGet_EZ_VersionsList.payload[0];
    }
  }

  // Get the version of the Stored Procedures and Views
  if (siemDatabaseStatusAndStatusAndVersions.sqlServerIsUp) {
    const siemDatabaseVersionsList = {};
    await getDataFromMsSql({
      targetVariable: siemDatabaseVersionsList,
      query: `
      SELECT
        [Name] AS 'name',
        [Version] AS 'version'
      FROM [EZ].[dbo].[get_EZ_Versions]
    `
    });

    if (
      siemDatabaseVersionsList
      && siemDatabaseVersionsList.payload
      && Array.isArray(siemDatabaseVersionsList.payload)
    ) {
      // eslint-disable-next-line max-len
      siemDatabaseStatusAndStatusAndVersions.storedProcedureAndViewsVersions = siemDatabaseVersionsList.payload;
    }
  }

  res.json(
    {
      errors: [],
      outputs: [],
      payload: siemDatabaseStatusAndStatusAndVersions,
      stillChecking: false
    }
  );
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
