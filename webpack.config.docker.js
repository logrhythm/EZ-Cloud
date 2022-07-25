/* eslint-disable max-len */
const CopyPlugin = require('copy-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const path = require('path');
const { version } = require('./package.json');

module.exports = {
  entry: {
    service: './src/index.js' // The main code of trhe service
    // installService: './installer/installService.dist.js',
    // uninstallService: './installer/uninstallService.dist.js',
    // serviceWrapper: './node_modules/node-windows/lib/wrapper.js'
  },
  output: {
    path: path.join(__dirname, 'dist', `EZ-Cloud.v${version}`, 'bin'),
    filename: '[name].js'
  },
  mode: 'production',
  target: 'node',
  stats: {
    errorDetails: true
  },
  module: {
    // This rule is to allow SSH2 and CPU-FEATURE compiled code (.node files) to be embedded:
    rules: [{ test: /\.node$/, use: 'raw-loader' }]
  },
  plugins: [
    // Copy all the necessary sample files to the relevant place under dist/
    new CopyPlugin({
      patterns: [
        { from: 'config.dist', to: path.join('..', 'config'), toType: 'dir' },
        { from: 'config.sample', to: path.join('..', 'config.sample'), toType: 'dir' },
        { from: 'public_web_root', to: path.join('..', 'public_web_root'), toType: 'dir' },
        { from: '.env.sample', to: path.join('..', '.env.sample'), toType: 'file' },
        { from: '.env.dist.docker', to: path.join('..', '.env'), toType: 'file' },
        { from: 'database', to: path.join('..', 'database'), toType: 'dir' },
        { from: 'LICENSE', to: path.join('..', 'License.txt'), toType: 'file' },
        { from: 'resources', to: path.join('..', 'resources'), toType: 'dir' },
        // // Service and wrapper support files:
        // { from: 'node_modules/node-windows/bin/winsw/winsw.exe', to: 'ezcloudserver.exe', toType: 'file' },
        // { from: 'node_modules/node-windows/bin/winsw/winsw.exe.config', to: 'ezcloudserver.exe.config', toType: 'file' },
        // { from: 'installer/ezcloudserver.xml', to: 'ezcloudserver.xml', toType: 'file' },
        // String obfuscation tool from LogRhythm
        { from: 'src/shared/encryptionTool.exe', to: 'encryptionTool.exe', toType: 'file' }, // TODO: Swap with Linux version of this
        { from: 'src/shared/encryptionTool.hashes.txt', to: 'encryptionTool.hashes.txt', toType: 'file' } // TODO: Swap with Linux version of this
        // // Small helpers for the Service management by user
        // { from: 'installer/installService.bat', to: './', toType: 'dir' },
        // { from: 'installer/uninstallService.bat', to: './', toType: 'dir' },
        // { from: 'installer/restartService.bat', to: './', toType: 'dir' }
      ]
    }),

    new WebpackShellPluginNext({
      onBuildExit: {
        scripts: [
          // Build the self contained Installer
          // `node ${path.join(__dirname, 'installer', 'installerBuilder')} --installerHelper "${path.join(__dirname, 'installer')}" --distDirectory "${path.join(__dirname, 'dist')}" --distSubDirectory "${path.join(__dirname, 'dist', `EZ-Cloud.v${version}`)}" `
        ],
        blocking: false,
        parallel: false
      }
    })
  ]
};
