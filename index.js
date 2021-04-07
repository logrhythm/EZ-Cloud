// Event logs handling
// https://github.com/coreybutler/node-windows#event-logging
var EventLogger = require('node-windows').EventLogger;
var log = new EventLogger('EZ-Cloud Server');

// Error handling
// Push a log to the Windows Application logs

function exitOnUncaughtException (err) {
  console.error('There was an uncaught error', err)
  log.error('There was an uncaught error: (' + (err.code ? err.code : '__NO_CODE__') + ') ' + (err.message ? err.message : '__NO_MESSAGE__'));
  process.exit(1)
}
process.on('uncaughtException', err => {
    exitOnUncaughtException(err);
  process.exit(1)
})

// log.info('Basic information.');
// log.warn('Watch out!');
// log.error('Something went wrong.');
// Can't get the following to work:
// log.auditSuccess('AUser Login Success');
// log.auditFailure('AUser Login Failure');

// SQL Connection
var Connection = require('tedious').Connection;  
    var config = {  
        server: 'localhost',  //update me
        authentication: {
            type: 'default',
            options: {
                userName: 'sa', //update me
                password: 'logrhythm!1'  //update me
            }
        },
        options: {
            // If you are on Microsoft Azure, you need encryption:
            encrypt: false,
            database: 'LogRhythmEMDB'  //update me
        }
    }; 
    var connection = new Connection(config);  
    connection.on('connect', function(err) {  
        // If no error, then good to proceed.  
        console.log("Connected");  
        executeStatement();  
    });  
    
    connection.connect();
  
    var Request = require('tedious').Request;  
    var TYPES = require('tedious').TYPES;  
  
    function executeStatement() {  
        request = new Request("SELECT [Major], [Minor], [Patch], [Revision], [DateUpdated] FROM [LogRhythmEMDB].[dbo].[SCDBVersion];", function(err) {  
        if (err) {  
            console.log(err);}  
        });  
        var result = "";  
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
              if (column.value === null) {  
                console.log('NULL');  
              } else {  
                result+= column.value + " ";  
              }  
            });  
            console.log(result);  
            result ="";  
        });  
  
        request.on('done', function(rowCount, more) {  
        console.log(rowCount + ' rows returned');  
        });  
        connection.execSql(request);  
    }  

console.log("RUNNING!");

// throw new Error('Ran out of coffee')

log.info('Exiting gracefuly.');
console.log("EXITING!");
process.exit(0);

