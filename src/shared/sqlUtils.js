// Get SQL config
const fs = require('fs');
const path = require('path');

// Create MS SQL object
const { Connection, Request, TYPES } = (
  process.env.databaseMode === 'mssql'
  || process.env.databaseMode === 'split'
    ? require('tedious')
    : { Connection: null, Request: null, TYPES: null }
);

// Create PostgreSQL object
const { Client } = (
  process.env.databaseMode === 'pgsql'
  || process.env.databaseMode === 'split'
    ? require('pg')
    : { Client: null }
);

// Load the System Logging functions
const { logToSystem } = require('./systemLogging');

// Get the crypto tools to work with password and keys
const { aesDecrypt } = require('./crypto');

function waitMilliseconds(delay = 250) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

const maxCheckInterval = 10; // Check once every X seconds max, and/or timeout after X seconds

//        ##     ## ######## #### ##       #### ######## #### ########  ######
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ######    ######
//        ##     ##    ##     ##  ##        ##     ##     ##  ##             ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//         #######     ##    #### ######## ####    ##    #### ########  ######

// ##########################################################################################
// getPgSqlConfig
// #########
// Utilitarian function to get the configuration
// necesary to be able to connect to PostgreSQL.
// ##########################################################################################

function getPgSqlConfig() {
  return {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'ez-backend',
    password: process.env.PG_PASS || undefined,
    database: process.env.PG_DB || 'ez',
    application_name: `${process.env.NAME} - Version: ${process.env.VERSION}`
  };
}

// ##########################################################################################
// getMsSqlConfig
// #########
// Utilitarian function to get the configuration
// necesary to be able to connect to MS SQL.
// ##########################################################################################

async function getMsSqlConfig() {
  // Full MS SQL: Get config from File
  if (process.env.databaseMode === 'mssql') {
    return JSON.parse(
      fs.readFileSync(
        path.join(process.env.baseDirname, 'config', 'database.json'), 'utf8'
      )
    ).config;
  }

  // PgSQL and Split: Get config from PgSQL
  if (
    process.env.databaseMode === 'pgsql'
    || process.env.databaseMode === 'split'
  ) {
    try {
      const pgClient = new Client(getPgSqlConfig());
      await pgClient.connect();
      // Get MS SQL configuration from Setting entry '6e5625e8-372d-4d4b-ac9a-615e370ac940'
      const res = await pgClient.query('SELECT "settingsJson" FROM public."settings" WHERE "uid" = $1;', ['6e5625e8-372d-4d4b-ac9a-615e370ac940']);
      await pgClient.end();

      const sqlConfig = JSON.parse(
        (
          res && res.rows && Array.isArray(res.rows) && res.rows.length === 1
            ? res.rows[0].settingsJson || { config: null }
            : { config: null }
        )
      ).config;

      // Decrypt secrets
      // The MS SQL host, port, login and password are AES encrypted in PgSQL using
      // the private AES key specific to the deployment
      if (sqlConfig && sqlConfig.authentication && sqlConfig.authentication.options) {
        // Hostname
        sqlConfig.server = aesDecrypt(
          sqlConfig.server
        );
        // Login
        sqlConfig.authentication.options.userName = aesDecrypt(
          sqlConfig.authentication.options.userName
        );
        // Pass
        sqlConfig.authentication.options.password = aesDecrypt(
          sqlConfig.authentication.options.password
        );
      }

      // And ship out!!
      return sqlConfig;
    } catch (error) {
      logToSystem('Error', `Persistance Layer | Connection to database (Pg) failed. | Details: ${error.message}`);
    }
  }

  logToSystem('Error', 'Database mode couldn\'t be determined or other error. Not returning any MS SQL connection configuration.');
  // Fallback to a NULL value so it's easy for the caller to check validity of the config
  return null;
}

// ##########################################################################################
// getDataFromMsSql
// #########
// Utilitarian function to get the data from
// SQL using parameters.query and dump it in the
// parameters.targetVariable
// ##########################################################################################

async function getDataFromMsSql(parameters) {
  let stillChecking = true;
  if (parameters && parameters.query && parameters.query.length && parameters.targetVariable) {
    const { targetVariable, query, variables } = parameters;
    targetVariable.stillChecking = true;
    targetVariable.errors = [];
    targetVariable.outputs = [];
    targetVariable.payload = [];

    try {
      // Connect
      const connection = new Connection(await getMsSqlConfig());

      // Connection event handler
      connection.on('connect', (connectionError) => {
        if (connectionError) {
          targetVariable.errors.push('Connection to database failed');
          targetVariable.stillChecking = false;
          stillChecking = false;
          // throw connectionError;
          logToSystem('Error', `Persistance Layer | Connection to database failed. | Details: ${JSON.stringify(connectionError)}`);
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

          // And close the SQL connection
          connection.close();
        });

        if (variables && Array.isArray(variables)) {
          variables.forEach((variable) => {
            if (variable.name && variable.name.length > 0) {
              request.addParameter(
                variable.name,
                TYPES[variable.type],
                (
                // eslint-disable-next-line no-nested-ternary
                  (variable.value !== undefined) && (variable.value !== null)
                    ? (
                      typeof variable.value === 'object'
                        ? JSON.stringify(variable.value)
                        : variable.value
                    )
                    : null
                )
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
    } catch (error) {
      logToSystem('Error', `Persistance Layer | Connection to database failed. | Details: ${error.message}`);
      targetVariable.errors.push('Connection to database failed');
      targetVariable.stillChecking = false;
      stillChecking = false;
    }
  }
}

// ##########################################################################################
// createMsSqlVariables
// #########
// Utilitarian function to create the array of
// fields type mapping to be provided to
// getDataFromMsSql as parameters.targetVariable
// ##########################################################################################

function createMsSqlVariables(req, definitions) {
  const variables = [];
  if (req && (req.query || req.body) && definitions && Array.isArray(definitions)) {
    definitions.filter((def) => def.name && def.type && def.name.length && def.type.length)
      .forEach((def) => {
        variables.push({
          name: def.name,
          type: def.type,
          /* eslint-disable no-nested-ternary */
          value: (
            req.body && (req.body[def.name] !== undefined)
              ? req.body[def.name]
              : (
                req.query && (req.query[def.name] !== undefined)
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
// createMsSqlVariablesAndStoredProcParams
// #########
// Utilitarian function to create the array of
// fields type mapping to be provided to
// getDataFromMsSql as parameters.targetVariable
// using createMsSqlVariables() and trimming any
// entry with a NULL or Undefined value.
//
// Useful when calling Stored Procedures that
// expect missing parameters to fall back on
// default values.
// ##########################################################################################

function createMsSqlVariablesAndStoredProcParams(req, definitions, weedOut = true) {
  // Prep SQL Variables
  const sqlVariablesRaw = createMsSqlVariables(req, definitions);

  // Weed out all the ones with NULL or Undefined
  // This is done as the SQL Stored Procedure will use default values if a param is not provided
  // But by default, createMsSqlVariables() puts NULL, and that's no good

  const storedProcedureParams = [];
  const sqlVariables = [];

  sqlVariablesRaw.forEach((variable) => {
    if ((variable.value !== undefined && variable.value !== null) || weedOut === false) {
      sqlVariables.push(variable);
      storedProcedureParams.push(`@${variable.name} = @${variable.name}`);
    }
  });

  return [sqlVariables, storedProcedureParams];
}

module.exports = {
  getMsSqlConfig,
  getDataFromMsSql,
  createMsSqlVariables,
  createMsSqlVariablesAndStoredProcParams
};
