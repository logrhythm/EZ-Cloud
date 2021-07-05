const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        service: './src/index.js'
    },
    output: {
        path: path.join(__dirname, 'dist', 'ez-cloud-server', 'bin'),
        filename: '[name].js'
    },
    mode: 'production',
    target: 'node',
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'config.dist', to: path.join('..', 'config'), toType: 'dir' },
                { from: 'config.sample', to: path.join('..', 'config.sample'), toType: 'dir' },
                { from: 'public_web_root', to: path.join('..', 'public_web_root'), toType: 'dir' },
                { from: '.env.sample', to: path.join('..', '.env.sample'), toType: 'file' },
                { from: '.env.dist', to: path.join('..', '.env'), toType: 'file' }
            ],
        }),
    ]
}
