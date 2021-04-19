module.exports = {
  env: {
    jest: true
  },
  extends: 'airbnb-base',

  rules: {
    'comma-dangle': ['error', 'never'],
    'no-underscore-dangle': 0,
    'no-param-reassign': 'warn',
    'no-return-assign': 'error',
    camelcase: 0,
    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }

};
