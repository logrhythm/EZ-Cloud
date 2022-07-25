/**
 * Build the Installer (using Inno Setup) and create/save its Hash (SHA256)
 * *
 * Changes log:
 * Tony Massé - 2022-07-25 - Adapt `installerBuilder` to bild Docker Container
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const yargs = require('yargs');
const path = require('path');
const spawn = require('cross-spawn');

const parsedArguments = yargs
  .option('distDirectory', {
    alias: 'd',
    description: '`dist` directory',
    type: 'string'
  })
  .option('distSubDirectory', {
    alias: 's',
    description: '`dist` sub-directory, including the version number',
    type: 'string'
  })
  .option('dockerFile', {
    alias: 'f',
    description: 'Pull path of the `Dockerfile` file',
    type: 'string'
  })
  .help()
  .alias('help', 'h')
  .argv;

// Grab the version from the Package file
const { version } = require('../package.json');

// Prep directories from parameters
const distDirectory = (
  parsedArguments && parsedArguments.distDirectory && parsedArguments.distDirectory.length
    ? parsedArguments.distDirectory
    : undefined
);

const distSubDirectory = (
  parsedArguments && parsedArguments.distSubDirectory && parsedArguments.distSubDirectory.length
    ? parsedArguments.distSubDirectory
    : undefined
);

const dockerFilePath = (
  parsedArguments && parsedArguments.dockerFile && parsedArguments.dockerFile.length
    ? parsedArguments.dockerFile
    : path.join(distSubDirectory || '', 'Dockerfile')
);

// Build the name of the new Installer
const versionTag = `v${version}`;

// Check all our ducks are in a row
if (
  distDirectory
  && distDirectory.length
  && distSubDirectory
  && distSubDirectory.length
  && dockerFilePath
  && dockerFilePath.length
  && versionTag
  && versionTag.length > 1
) {
  // Run Docker to build the Container
  // eslint-disable-next-line no-console
  console.log('👷 Build the Container...');

  try {
    const docketBuildResult = spawn.sync('docker', ['build', '--tag', `tonymasse/oc-admin:${versionTag}`, '--tag', 'tonymasse/oc-admin:latest', '--file', dockerFilePath, distSubDirectory], {});
    // eslint-disable-next-line no-console
    console.log((docketBuildResult && docketBuildResult.stdout ? docketBuildResult.stdout : '').toString().trim());
    if (docketBuildResult.error) {
      // eslint-disable-next-line no-console
      console.log('🔴 Oopsy Daisy - Error while running `Docker Build` with parameters:', JSON.stringify(docketBuildResult.error.spawnargs || []), ' - Error was:', docketBuildResult.error.message);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('🔴 Oopsy Daisy - ', error.message);
  }
} else {
  // eslint-disable-next-line no-console
  console.log('Some of the parameters are missing. Run with `--help` for more information.');
}
