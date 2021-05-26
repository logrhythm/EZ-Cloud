
// // Get SQL config
// const fs = require('fs');
// const path = require('path');

// const configSql = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'database.json'), 'utf8')).config;
// // Create SQL object
// const { Connection, Request, TYPES } = require('tedious');

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

function checkCredentials(creds) {
  let valid = false;
  if (creds && creds.login && creds.password) {
    try {
      // do the check
      valid = true;
    } catch (error) {
      //
    }
  }
  return valid;
}

module.exports = checkCredentials;
