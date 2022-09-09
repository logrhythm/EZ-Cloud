/**
 * Build the script that builds the `oc-admin` Docker Container
 * *
 * Changes log:
 * Tony Massé - 2022-07-25 - Adapt `installerBuilder` to bild Docker Container
 * Tony Massé - 2022-08-05 - Add `LATEST_TAG` to the Docker command
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const yargs = require('yargs');
const fs = require('fs');
const path = require('path');

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
    description: 'Full path of the `Dockerfile` file',
    type: 'string'
  })
  .option('dockerBuildScriptTemplate', {
    alias: 't',
    description: 'Full path to the `_docker.build-oc-admin.sh` template file',
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
    : path.join('.', 'Dockerfile')
);

const dockerBuildScriptTemplatePath = (
  parsedArguments
  && parsedArguments.dockerBuildScriptTemplate
  && parsedArguments.dockerBuildScriptTemplate.length
    ? parsedArguments.dockerBuildScriptTemplate
    : path.join('.', '_docker.build-TEMPLATE.sh')
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
  && dockerBuildScriptTemplatePath
  && dockerBuildScriptTemplatePath.length
) {
  // Run Docker to build the Container
  // eslint-disable-next-line no-console
  console.log('👷 Build the Container building script...');

  try {
    const dockerCommand = `docker build --tag "tonymasse/oc-admin:${versionTag}" --tag "tonymasse/oc-admin:$LATEST_TAG" --file "${dockerFilePath}" "${distSubDirectory}"`;
    const dockerScriptPath = path.join(distDirectory, '_docker.build-oc-admin.sh');

    // Read template from disk
    let dockerScriptTemplate = fs.readFileSync(dockerBuildScriptTemplatePath, { encoding: 'utf-8' }) || '';

    // Replace token
    dockerScriptTemplate = String(dockerScriptTemplate).replaceAll('#_DOCKER_COMMAND_GOES_HERE', dockerCommand);

    // Write to disk
    fs.writeFileSync(dockerScriptPath, dockerScriptTemplate);

    /* eslint-disable no-console */
    console.log('🟢 Docker Container building script created.');
    console.log('You now want to run the following command:');
    console.log('cd /var/lib/docker/volumes/oc-admin_dev/_data/ && chmod +x _docker.build-oc-admin.sh && _docker.build-oc-admin.sh');
    console.log('🏁');
    console.log('');
    /* eslint-enable no-console */
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('🔴 Oopsy Daisy - ', error.message);
  }
} else {
  // eslint-disable-next-line no-console
  console.log('Some of the parameters are missing. Run with `--help` for more information.');
}
