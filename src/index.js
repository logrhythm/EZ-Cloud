/**
 * EZ-Cloud Onboarding for Legacy SIEM
 *
 * @summary Main file for service
 * @author Tony Massé
 *
 * Created at     : 2021-04-07 15:00:00
 * Last modified  : 2021-05-25 12:55:56
 */

// import AutoGitUpdate from 'auto-git-update';
const AutoGitUpdate = require('auto-git-update');

// eslint-disable-next-line import/no-extraneous-dependencies
const { EventLogger } = require('node-windows');
const path = require('path');

const log = new EventLogger('EZ-Cloud Server');

// Error handling
// Push a log to the Windows Application logs

function exitOnUncaughtException(err) {
  // eslint-disable-next-line no-console
  console.error('There was an uncaught error', err);
  log.error(`There was an uncaught error: (${err.code ? err.code : '__NO_CODE__'}) ${err.message ? err.message : '__NO_MESSAGE__'}`);
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

// eslint-disable-next-line no-console
console.log(`${process.env.NAME} - Version: ${process.env.VERSION} - Started`);
log.info(`${process.env.NAME} - Version: ${process.env.VERSION} - Started`);

async function checkForNewVersion() {
  const updater = new AutoGitUpdate({
    repository: 'https://github.com/TonyMasse/EZ-Cloud',
    tempLocation: path.join(process.env.TEMP, 'EZ_Cloud-Upgrade'),
    ignoreFiles: [
      'config/database.json',
      'config/https.cert.pem',
      'config/https.key.pem',
      'config/https.keytmp.pem',
      'config/ssh.json'
    ],
    branch: 'master',
    // executeOnComplete: 'NET RESTART',
    exitOnComplete: true
  });

  // eslint-disable-next-line no-console
  console.log('Checking for updates...');
  await updater.autoUpdate();
  // const versionComparison = await updater.compareVersions();
  // eslint-disable-next-line no-console
  // console.log(versionComparison);
}

checkForNewVersion();

// app.listen(port, host, () => {
httpsServer.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening for HTTPS requests on: https://${host}:${port}`);
  log.info(`Listening for HTTPS requests on: https://${host}:${port}`);
});
