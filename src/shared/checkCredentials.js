// Load the System Logging functions
const { logToSystem } = require('./systemLogging');

// Load the SQL Utils
const {
  getPgSqlConfig,
  getMsSqlConfig
} = require('./sqlUtils');

function waitMilliseconds(delay = 250) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

// Create MS SQL object
const { Connection } = (
  process.env.databaseMode === 'mssql'
  || process.env.databaseMode === 'split'
    ? require('tedious')
    : { Connection: null }
);

// Create PostgreSQL object
const { Client } = (
  process.env.databaseMode === 'pgsql'
  || process.env.databaseMode === 'split'
    ? require('pg')
    : { Client: null }
);

const timeoutSeconds = 5; // Timeout after X seconds

// Check if the Creds are valid, by trying to authenticate against the SQL server
async function checkCredentials(creds) {
  const response = {
    username: '',
    valid: false
  };
  let stillChecking = true;
  if (creds && creds.login && creds.password) {
    if (process.env.databaseMode === 'mssql') {
      // Using MS SQL to authenticate

      try {
        // Get SQL config
        const configSql = await getMsSqlConfig();

        // Remove saved Credentials
        // first Login
        if (
          configSql
          && configSql.authentication
          && configSql.authentication.options
          && configSql.authentication.options.userName
        ) {
          delete configSql.authentication.options.userName;
        }
        // then Password
        if (
          configSql
          && configSql.authentication
          && configSql.authentication.options
          && configSql.authentication.options.password
        ) {
          delete configSql.authentication.options.password;
        }

        // Prep the Creds in the SQL config
        configSql.authentication.options.userName = creds.login;
        configSql.authentication.options.password = creds.password;

        // Connect
        const connection = new Connection(configSql);

        // Connection event handler
        connection.on('connect', (connectionError) => {
          if (!connectionError) {
            response.username = creds.login;
            response.valid = true;
          }
          try {
            connection.close();
          } catch (error) {
            //
          } finally {
            stillChecking = false;
          }
        });

        // try to connect
        connection.connect();

        // Wait, by default, for the attempt to happen (or fail) before returning to caller
        const loopEndTime = Date.now() / 1000 + timeoutSeconds;

        // Waiting - Sync
        while (stillChecking && (loopEndTime > (Date.now() / 1000))) {
          // Wait for 50 ms
          // eslint-disable-next-line no-await-in-loop
          await waitMilliseconds(50);
        }
        stillChecking = false;
      } catch (error) {
        logToSystem('Error', `Authentication | Failed to authenticate against external DB / Access denied. | Details: ${error.message}`);
      }
    } else {
      // Using PostgreSQL to authenticate

      try {
        // Get SQL config
        const configSql = await getPgSqlConfig();

        // Remove saved Credentials
        // first Login
        if (configSql && configSql.password) {
          delete configSql.user;
        }
        // then Password
        if (configSql && configSql.password) {
          delete configSql.password;
        }

        // Prep the Creds in the SQL config
        configSql.user = String(creds.login).toLowerCase(); //  PgSQL is case sensitive,
        //                                                      so bring all logins to lowercase
        configSql.password = creds.password;

        // Connect
        const pgClient = new Client(configSql);
        // Connection event handler
        // try to connect
        await pgClient.connect();
        response.username = creds.login;
        response.valid = true;
        await pgClient.end();
      } catch (error) {
        logToSystem('Error', `Authentication | Failed to authenticate against internal DB / Access denied. | Details: ${error.message}`);
      }
    }
  }
  return response;
}

module.exports = checkCredentials;
