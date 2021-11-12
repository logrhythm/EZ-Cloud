const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');

const express = require('express');

const router = express.Router();
const checkCredentials = require('../shared/checkCredentials');

// Import SQL Utilities
const { getDataFromSql, createSqlVariables } = require('../shared/sqlUtils');

// Get JWT Secret and TTL
const jwtConfig = JSON.parse(fs.readFileSync(path.join(process.env.baseDirname, 'config', 'jwt.json'), 'utf8'));
const jwtSecret = (jwtConfig && jwtConfig.secret ? jwtConfig.secret : '');
const jwtTtl = (jwtConfig && jwtConfig.ttl ? jwtConfig.ttl : '1h');

const createTokenSendResponse = (user, roles, res, next) => {
  const payload = {
    username: user || '',
    roles: roles || []
  };

  jwt.sign(
    payload,
    jwtSecret, {
      expiresIn: jwtTtl
    }, (err, token) => {
      if (err) {
        res.status(422);
        const error = Error('Unable to login');
        next(error);
      } else {
        // login all good
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
  }).then(async (checkedCreds) => {
    if (checkedCreds.valid === true) {
      // If YES

      // Get the Roles for the User
      const userRolesFromSql = {};
      const userRoles = [];

      await getDataFromSql({
        targetVariable: userRolesFromSql,
        query: `
        SELECT DISTINCT [rbacRoles].[name] AS 'roles'
          FROM [dbo].[rbacRoles]
            INNER JOIN [dbo].[rbacUserToRole] ON [rbacRoles].[uid] = [rbacUserToRole].[roleUid]
          WHERE [login] = 'ezAdmin'
        `
      });

      // Clean it up
      if (userRolesFromSql && userRolesFromSql.payload && Array.isArray(userRolesFromSql.payload)) {
        userRolesFromSql.payload.forEach((item) => {
          console.log('item:', item);
          if (item && item.roles && item.roles.length) {
            userRoles.push(item.roles);
          }
        });
      }

      //   Create JWT token
      //   Return token
      createTokenSendResponse(
        checkedCreds.username, // Login name
        userRoles, // Array of Roles
        res,
        next
      );
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
