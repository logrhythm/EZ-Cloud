/**
 * EZ-Cloud Onboarding for Legacy SIEM
 *
 * @summary Main file for service
 * @author Tony Massé
 *
 * Created at     : 2021-04-07 15:00:00
 * Last modified  : 2022-07-11 18:40:00
 */

const path = require('path');
require('dotenv').config();

// Storing the base directory name of the process, to be used elsewere while loading configuration
// and other files.
// The reason for this is that once packed, all these calls are made from the very same file,
// so __dirname of source files in sub-directories don't reflect the __dirname once packed.
// Define the base directory name of the process
process.env.baseDirname = process.env.baseDirname || path.join(__dirname, '..');

// Load the System Logging functions
const { getLevelToInt, logToSystem } = require('./shared/systemLogging');

// Bring in the Log Level as an integer
process.env.logLevel = getLevelToInt(process.env.LOGLEVEL || 'Information');
process.env.logFilePath = process.env.LOGFILEPATH || undefined;
process.env.logForceToConsole = process.env.LOGFORCETOCONSOLE || false;

/**
 * Error handling - Push a log to the Windows Application logs
 * @param {*} err Error object
 */
function exitOnUncaughtException(err) {
  try {
    logToSystem('Critical', `There was an uncaught error: (${err.code ? err.code : '__NO_CODE__'}) ${err.message ? err.message : '__NO_MESSAGE__'} ${(process.env.NODE_ENV === 'development' ? ` // ${err.stack}` : '')}`, true);
  } catch (error) {
    // Last resort
    // eslint-disable-next-line no-console
    console.error('There was an uncaught error', err);
    // eslint-disable-next-line no-console
    console.error('Could not log it on the system\'s journal', error);

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Stack for uncaught error:', err.stack);
      // eslint-disable-next-line no-console
      console.error('Stack for logging error:', error.stack);
    }
  }
  process.exit(1);
}

process.on('uncaughtException', (err) => {
  exitOnUncaughtException(err);
  process.exit(1);
});

// Database mode
// "mssql": All the database activities are done on the MS SQL engine of the PM/XM server
// "pgsql": All the database activities are done on the PostreSQL engine containerised on the OC
// "split": Configuration is stored in Postgres, SIEM integration through MS SQL
process.env.databaseMode = String(process.env.DB_MODE || 'mssql').toLowerCase();

// Retry delay, in seconds, between checks to DBs.
// The actual retry time is based on this number, but increased with each attempt to connect.
process.env.databaseCheckDelay = String(process.env.DB_CHECK_DELAY_IN_SECONDS || '2').toLowerCase();

// Maximum retry delay, in seconds, between checks to DBs.
// This caps the actual retry delay, as it's increased with each attempt.
process.env.databaseMaxCheckDelay = String(process.env.DB_MAX_CHECK_DELAY_IN_SECONDS || '120').toLowerCase();

// Load the SQL Utils
const {
  checkPersistenceAvailability
} = require('./shared/sqlUtils');

// const app = require('./app');
const httpsServer = require('./app');

const port = process.env.PORT || 8400;
const host = process.env.HOST || 'localhost';

// Service name and version
const version = require('./shared/version'); // Version file is generated at build time

process.env.NAME = 'EZ-Cloud Onboarding for Legacy SIEM';
process.env.VERSION = version;

logToSystem('Information', `${process.env.NAME} - Version: ${process.env.VERSION} - Started`, true);

// app.listen(port, host, () => {
httpsServer.listen(port, host, () => {
  logToSystem('Information', `Listening for HTTPS requests on: https://${host}:${port}`, true);
  // Check for DB connectivity, and keep checking if not
  checkPersistenceAvailability(true);
});
