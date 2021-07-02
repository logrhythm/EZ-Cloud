const path = require("path");

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist', 'ez-cloud-server', 'bin'),
        filename: 'main.js'
    },
    mode: 'production',
    target: 'node'
}
