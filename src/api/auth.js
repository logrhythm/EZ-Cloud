const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');

const express = require('express');

const router = express.Router();
const checkCredentials = require('../shared/checkCredentials');

// Get JWT Secret
const jwtSecret = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'jwt.json'), 'utf8')).secret;

const createTokenSendResponse = (user, res, next) => {
  const payload = {
    username: user || ''
  };

  jwt.sign(
    payload,
    jwtSecret, {
      expiresIn: '1h'
    }, (err, token) => {
      if (err) {
        res.status(422);
        const error = Error('Unable to login');
        next(error);
      } else {
      // login all good
        // res.json({ token });
        res.json({
          payload: { token }, // null (unchecked) or object with token
          errors: [], // array of all the errors
          outputs: [] // array of all the outputs
        });
      }
    }
  );
};

router.get('/', (req, res) => {
  res.json({ options: ['Login', 'Logout'] });
});

router.post('/Login', async (req, res, next) => {
  // Check Creds are valid and can login
  // If YES
  //   Create JWT token
  //   Return token
  // If NO
  //   Return error

  // Check Creds are valid and can login
  checkCredentials({
    login: (req.body && req.body.username ? req.body.username : ''),
    password: (req.body && req.body.password ? req.body.password : '')
  }).then((areCredsValid) => {
    if (areCredsValid === true) {
      // If YES
      //   Create JWT token
      //   Return token
      createTokenSendResponse(req.user, res, next);
    } else {
      // If NO
      //   Return error
      res.status(401);
      const error = Error('Unable to login');
      next(error);
    }
  });
});

module.exports = router;
