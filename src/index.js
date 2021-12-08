/**
 * EZ-Cloud Onboarding for Legacy SIEM
 *
 * @summary Main file for service
 * @author Tony Massé
 *
 * Created at     : 2021-04-07 15:00:00
 * Last modified  : 2021-12-08 00:35:42
 */

const path = require('path');
require('dotenv').config();

// Storing the base directory name of the process, to be used elsewere while loading configuration and other files
// The reason for this is that once packed, all these calls are made from the very same file, so __dirname of source
// files in sub-directories don't reflect the __dirname once packed.
// Define the base directory name of the process
process.env.baseDirname = process.env.baseDirname || path.join(__dirname, '..');

// Load the System Logging functions
const { getLevelToInt, logToSystem } = require('./shared/systemLogging');

// Bring in the Log Level as an integer
process.env.logLevel = getLevelToInt(process.env.LOGLEVEL || 'Information');
process.env.logForceToConsole = process.env.LOGFORCETOCONSOLE || false;

// Error handling
// Push a log to the Windows Application logs
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

// const app = require('./app');
const httpsServer = require('./app');

const port = process.env.PORT || 8400;
const host = process.env.HOST || 'localhost';

// Service name and version
process.env.NAME = 'EZ-Cloud Onboarding for Legacy SIEM';
process.env.VERSION = process.env.npm_package_version;

logToSystem('Information', `${process.env.NAME} - Version: ${process.env.VERSION} - Started`, true);

// app.listen(port, host, () => {
httpsServer.listen(port, host, () => {
  logToSystem('Information', `Listening for HTTPS requests on: https://${host}:${port}`, true);
});
