// eslint-disable-next-line import/no-extraneous-dependencies
const yargs = require('yargs');

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

// eslint-disable-next-line import/no-extraneous-dependencies
require('innosetup')(
  './installer/installerBuilder.iss',
  {
    O: (
      parsedArguments && parsedArguments.distDirectory && parsedArguments.distDirectory.length
        ? parsedArguments.distDirectory
        : undefined
    ),
    F: `EZ-Cloud.v${version}.Server-Installer`,
    DVersion: version,
    DDistDirectory: (
      parsedArguments && parsedArguments.distDirectory && parsedArguments.distDirectory.length
        ? parsedArguments.distDirectory
        : undefined
    ),
    DDistSubDirectory: (
      parsedArguments && parsedArguments.distSubDirectory && parsedArguments.distSubDirectory.length
        ? parsedArguments.distSubDirectory
        : undefined
    // ),
    // DInstallerHelper: (
    //   parsedArguments && parsedArguments.installerHelper && parsedArguments.installerHelper.length
    //     ? parsedArguments.installerHelper
    //     : undefined
    )
  },
  (error) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.log(error);
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
