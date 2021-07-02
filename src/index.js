/**
 * EZ-Cloud Onboarding for Legacy SIEM
 *
 * @summary Main file for service
 * @author Tony Massé
 *
 * Created at     : 2021-04-07 15:00:00
 * Last modified  : 2021-05-25 12:55:56
 */

const path = require('path');

// Load the System Logging functions
const { getLevelToInt, logToSystem } = require('./shared/systemLogging');

// Bring in the Log Level as an integer
process.env.logLevel = getLevelToInt('Debug'); // XXXX
process.env.logForceToConsole = true; // XXXX

// Error handling
// Push a log to the Windows Application logs
function exitOnUncaughtException(err) {
  try {
    logToSystem('Critical', `There was an uncaught error: (${err.code ? err.code : '__NO_CODE__'}) ${err.message ? err.message : '__NO_MESSAGE__'}`, true);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('There was an uncaught error', err);
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
