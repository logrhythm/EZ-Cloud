const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');

// Get JWT Secret and TTL
const jwtSecret = JSON.parse(fs.readFileSync(path.join(process.env.baseDirname, 'config', 'jwt.json'), 'utf8')).secret;

function isValidAuth(socket, next) {
  const { token } = socket.handshake.auth;
  let validAuthToken = false;

  if (token && token.length && jwtSecret && jwtSecret.length) {
    // use jwt lib to decode
    jwt.verify(token, jwtSecret, (error, user) => {
      if (!error) {
        validAuthToken = true;
      }
      // eslint-disable-next-line no-param-reassign
      socket.handshake.auth.user = user.username;
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
