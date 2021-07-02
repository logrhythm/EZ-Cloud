const path = require("path");

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist', 'bin'),
        filename: 'main.js'
    },
    mode: 'production',
    target: 'node'
}
