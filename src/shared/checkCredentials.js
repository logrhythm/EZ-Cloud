const fs = require('fs');
const path = require('path');

function waitMilliseconds(delay = 250) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

// Get SQL config
const configSql = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '..', '..', 'config', 'database.json'), 'utf8'
  )
).config;

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

// Create SQL object
const { Connection } = require('tedious');

const timeoutSeconds = 5; // Timeout after X seconds

// Check if the Creds are valid, by trying to authenticate against the SQL server
async function checkCredentials(creds) {
  let valid = false;
  let stillChecking = true;
  if (creds && creds.login && creds.password) {
    try {
      // Prep the Creds in the SQL config
      configSql.authentication.options.userName = creds.login;
      configSql.authentication.options.password = creds.password;

      // Connect
      const connection = new Connection(configSql);

      // Connection event handler
      connection.on('connect', (connectionError) => {
        if (!connectionError) {
          valid = true;
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
      //
    }
  }
  return valid;
}

module.exports = checkCredentials;
