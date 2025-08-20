
module.exports = {
  presets: [
    '@quasar/babel-preset-app'
  ],
  plugins: [
    '@babel/plugin-transform-optional-chaining',
    // Add transform for nullish coalescing - used in theme service
    '@babel/plugin-transform-nullish-coalescing-operator'
  ]
}
