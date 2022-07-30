/**
 * Build the Installer (using Inno Setup) and create/save its Hash (SHA256)
 * *
 * Changes log:
 * Tony Massé - 2021-09-17 - Inno Setup encapsulation script
 * Tony Massé - 2022-02-04 - Add Hash calculation
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const yargs = require('yargs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const parsedArguments = yargs
  // .option('installerHelper', {
  //   alias: 's',
  //   description: 'installer directory containing Microsoft Signing Tool and Code Signing certificate(s)',
  //   type: 'string'
  // })
  .option('distDirectory', {
    alias: 'd',
    description: 'dist directory',
    type: 'string'
  })
  .option('distSubDirectory', {
    alias: 's',
    description: 'dist sub-directory',
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

// const installerHelper = (
//   parsedArguments && parsedArguments.installerHelper && parsedArguments.installerHelper.length
//     ? parsedArguments.installerHelper
//     : undefined
// );

// Build the name of the new Installer
const targetInstallerFileName = `OC-Admin.v${version}.Server-Installer`;
const targetInstallerFileNameWithExt = `OC-Admin.v${version}.Server-Installer.exe`;
const targetInstallerFileFullPath = path.join(distDirectory, targetInstallerFileNameWithExt);

// Run Inno Setup to build the installer
// eslint-disable-next-line no-console
console.log('👷 Build the installer...');
// eslint-disable-next-line import/no-extraneous-dependencies
require('innosetup')(
  './installer/installerBuilder.iss',
  {
    O: distDirectory,
    F: targetInstallerFileName,
    DVersion: version,
    DDistDirectory: distDirectory,
    DDistSubDirectory: distSubDirectory
    // DInstallerHelper: installerHelper
  },
  (buildError) => {
    if (buildError) {
      // eslint-disable-next-line no-console
      console.log('❌ Failed.', buildError);
    } else {
      // eslint-disable-next-line no-console
      console.log('✔️  Done. File: ', targetInstallerFileNameWithExt);

      // Create the SHA256 hash of the fresh Installer.exe file and write it to disk
      // eslint-disable-next-line no-console
      console.log(`⚙ Create the SHA256 hash of the fresh "${targetInstallerFileNameWithExt}" file...`);
      try {
        const fileBuffer = fs.readFileSync(targetInstallerFileFullPath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);

        const hashAsHex = hashSum.digest('hex');

        // Build the SHA file name
        const targetHashFileName = `${targetInstallerFileFullPath}.sha256`;

        // Write to disk
        fs.writeFileSync(targetHashFileName, hashAsHex);

        // eslint-disable-next-line no-console
        console.log('✔️  Done. Hash:', hashAsHex);
      } catch (hashError) {
        // eslint-disable-next-line no-console
        console.error('❌ Failed.', hashError.message);
      }
    }
  }
);

//
// Usage:  iscc [options] scriptfile.iss
// or to read from standard input:  iscc [options] -
// Options:
//   /O(+|-)            Enable or disable output (overrides Output)
//   /O<path>           Output files to specified path (overrides OutputDir)
//   /F<filename>       Overrides OutputBaseFilename with the specified filename
//   /S<name>=<command> Sets a SignTool with the specified name and command
//   /Q                 Quiet compile (print error messages only)
//   /Qp                Enable quiet compile while still displaying progress
//   /D<name>[=<value>] Emulate #define public <name> <value>
//   /$<letter>(+|-)    Emulate #pragma option -<letter>(+|-)
//   /P<letter>(+|-)    Emulate #pragma parseroption -<letter>(+|-)
//   /I<paths>          Emulate #pragma include <paths>
//   /J<filename>       Emulate #include <filename>
//   /{#<string>        Emulate #pragma inlinestart <string>
//   /}<string>         Emulate #pragma inlineend <string>
//   /V<number>         Emulate #pragma verboselevel <number>
//   /?                 Show this help screen
//
// Example: iscc /$c- /Pu+ "/DLic=Trial Lic.txt" /IC:\INC;D:\INC scriptfile.iss
//
