const CopyPlugin = require('copy-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const path = require('path');
const { version } = require('./package.json');

module.exports = {
  entry: {
    service: './src/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist', `EZ-Cloud.v${version}`, 'bin'),
    filename: '[name].js'
  },
  mode: 'production',
  target: 'node',
  plugins: [
    // Copy all the necessary sample files to the relevant place under dist/
    new CopyPlugin({
      patterns: [
        { from: 'config.dist', to: path.join('..', 'config'), toType: 'dir' },
        { from: 'config.sample', to: path.join('..', 'config.sample'), toType: 'dir' },
        { from: 'public_web_root', to: path.join('..', 'public_web_root'), toType: 'dir' },
        { from: '.env.sample', to: path.join('..', '.env.sample'), toType: 'file' },
        { from: '.env.dist', to: path.join('..', '.env'), toType: 'file' },
        { from: 'database', to: path.join('..', 'database'), toType: 'dir' }
      ]
    }),

    new WebpackShellPluginNext({
      onBuildExit: {
        scripts: [
          // Create a Zip file for this packaged version
          // eslint-disable-next-line prefer-template
          'PowerShell.exe -Command Compress-Archive -Path "' + path.join(__dirname, 'dist', `EZ-Cloud.v${version}`) + '" -DestinationPath "' + path.join(__dirname, 'dist', `EZ-Cloud_v${version}.zip` + '" -Force'),
          `node ${path.join(__dirname, 'installer', 'installerBuilder')} --distDirectory "${path.join(__dirname, 'dist')}" --distSubDirectory "${path.join(__dirname, 'dist', `EZ-Cloud.v${version}`)}" `
        ],
        blocking: false,
        parallel: false
      }
    })
  ]
};
