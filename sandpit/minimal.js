var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('../config/database.json', 'utf8')).config;

// var config = {
//   server: 'localhost',
//   authentication: {
//     type: 'default',
//     options: {
//       userName: 'sa',
//       password: 'logrhythm!1'
//     }
//   },
//   options: {
//     // If you are on Microsoft Azure, you need encryption:
//     encrypt: false,
//     database: 'LogRhythmEMDB',  //update me
//     port: 1433 // Default Port
//   }
// };

const connection = new Connection(config);

connection.on('connect', (err) => {
  if (err) {
    console.log('Connection Failed');
    throw err;
  }

  executeStatement();
});

connection.connect();

function executeStatement() {
  const request = new Request('select * from [LogRhythmEMDB].[dbo].[SCDBVersion];', (err, rowCount) => {
    if (err) {
      throw err;
    }

    console.log('DONE!');
    connection.close();
  });

  // Emits a 'DoneInProc' event when completed.
  request.on('row', (columns) => {
    columns.forEach((column) => {
      if (column.value === null) {
        console.log('NULL');
      } else {
        console.log(column.value);
      }
    });
  });

  request.on('done', (rowCount) => {
    console.log('Done is called!');
  });

  request.on('doneInProc', (rowCount, more) => {
    console.log(rowCount + ' rows returned');
  });

  // In SQL Server 2000 you may need: connection.execSqlBatch(request);
  connection.execSql(request);
}