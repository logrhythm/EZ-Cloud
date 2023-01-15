/* eslint-disable max-len */
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const path = require('path');
const { version } = require('./package.json');

const distSubDir = `OC-Admin.v${version}`;

module.exports = {
  entry: {
    service: './src/index.js' // The main code of trhe service
    // installService: './installer/installService.dist.js',
    // uninstallService: './installer/uninstallService.dist.js',
    // serviceWrapper: './node_modules/node-windows/lib/wrapper.js'
  },
  output: {
    path: path.join(__dirname, 'dist', distSubDir, 'bin'),
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
    // Ignore absence of optional module `pg-native` of module `pg` (pg/lib/native)
    new webpack.IgnorePlugin({
      resourceRegExp: /pg-native/,
      contextRegExp: /pg\/lib\/native$/
    }),
    // Ignore absence of optional module `cpu-features` of module `ssh2` (ssh2/lib/protocol)
    new webpack.IgnorePlugin({
      resourceRegExp: /cpu-features/,
      contextRegExp: /ssh2\/lib\/protocol$/
    }),
    // Ignore absence of optional module `sshcrypto.node` of module `ssh2` (ssh2/lib/protocol)
    new webpack.IgnorePlugin({
      resourceRegExp: /sshcrypto.node/,
      contextRegExp: /ssh2\/lib\/protocol$/
    }),
    // Copy all the necessary sample files to the relevant place under dist/
    new CopyPlugin({
      patterns: [
        // { from: 'config.dist', to: path.join('..', 'config'), toType: 'dir' }, // Removed as now handled by startup script from config.sample/
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
        { from: 'src/shared/encryptionTool', to: 'encryptionTool', toType: 'file' },
        { from: 'src/shared/encryptionTool.hashes.txt', to: 'encryptionTool.hashes.txt', toType: 'file' },
        // // Small helpers for the Service management by user
        // { from: 'installer/installService.bat', to: './', toType: 'dir' },
        // { from: 'installer/uninstallService.bat', to: './', toType: 'dir' },
        // { from: 'installer/restartService.bat', to: './', toType: 'dir' }
        // Docker file
        { from: 'docker/Dockerfile', to: path.join('..', '..', 'Dockerfile'), toType: 'file' }
      ]
    }),

    new WebpackShellPluginNext({
      onBuildExit: {
        scripts: [
          // Build the MS SQL DB script for Docker deployments
          `cd ${path.join(__dirname, 'dist', distSubDir)} && zip "${path.join(__dirname, 'dist', `${distSubDir}.EZ_database_for_Docker.zip`)}" database/create_database_for_Docker.bat database/*.00*.sql database/*.09*.sql database/*.10*.sql database/*.11*.sql database/*.12*.sql database/*.13*.sql database/*.14*.sql database/*.15*.sql database/*.16*.sql database/*.24*.sql database/*.25*.sql `,
          // Build the Docker Container
          `node ${path.join(__dirname, 'docker', 'dockerContainerBuilder')} --distDirectory "dist" --distSubDirectory "${distSubDir}/" --dockerFile "./Dockerfile" --dockerBuildScriptTemplate "${path.join('docker', '_docker.build-TEMPLATE.sh')}" `
        ],
        blocking: false,
        parallel: false
      }
    })
  ]
};
