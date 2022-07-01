const jwt = require('jsonwebtoken');

// const fs = require('fs');
// const path = require('path');

// Import Config Loaders
const {
  getJwtConfig
} = require('../shared/loadConfigUtils');

async function isValidAuth(socket, next) {
  const { token } = socket.handshake.auth;
  let validAuthToken = false;

  // Get JWT Secret
  const jwtToken = await getJwtConfig();
  const jwtSecret = (
    jwtToken
      ? jwtToken.secret
      : ''
  );

  if (token && token.length && jwtSecret && jwtSecret.length) {
    // use jwt lib to decode
    jwt.verify(token, jwtSecret, (error, user) => {
      if (!error) {
        validAuthToken = true;
      }
      // eslint-disable-next-line no-param-reassign
      socket.handshake.auth.user = (user ? user.username : null);
    });
  }

  if (validAuthToken) {
    next();
  } else {
    const err = new Error('not authorized');
    err.data = { content: 'Invalid Authentication Token' };
    next(err);
  }
}

module.exports = {
  isValidAuth
};
