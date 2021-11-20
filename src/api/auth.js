const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');

const express = require('express');

const router = express.Router();
const checkCredentials = require('../shared/checkCredentials');

// Load the System Logging functions
const { logToSystem } = require('../shared/systemLogging');

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
        logToSystem('Error', 'JWT | Unable to sign Token. Denying access to user with HTTP Code 422.');
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
    let denyAccess = true;

    if (checkedCreds.valid === true) {
      // If YES

      // Get the Roles for the User
      const userRolesFromSql = {};
      const userRoles = [];
      let isUserPriviledged = false;

      await getDataFromSql({
        targetVariable: userRolesFromSql,
        query: `
        SELECT -- [rbacUserToRole].[id] AS 'userID'
          [rbacUserToRole].[login] AS 'userLogin'
          -- ,[rbacRoles].[uid] AS 'roleUid'
          ,[rbacRoles].[name] AS 'roleName'
          ,[rbacRoles].[isPriviledged] AS 'roleIsPriviledged'
        FROM [EZ].[dbo].[rbacRoles]
          RIGHT OUTER JOIN [EZ].[dbo].[rbacUserToRole] ON [rbacRoles].[uid] = [rbacUserToRole].[roleUid]
        WHERE [rbacUserToRole].[login] = @username
        `,
        variables: createSqlVariables(
          req,
          [
            { name: 'username', type: 'NVarChar' }
          ]
        )
      });

      // Report on SQL Error, if any
      if (
        userRolesFromSql
        && userRolesFromSql.errors
        && Array.isArray(userRolesFromSql.errors)
        && userRolesFromSql.errors.length
      ) {
        logToSystem('Warning', 'Login | SQL Returned an error while querying the Roles for the User.');
        logToSystem('Debug', `Login | SQL Errors: ${JSON.stringify(userRolesFromSql.errors)}.`);
      }

      // Clean it up
      if (userRolesFromSql && userRolesFromSql.payload && Array.isArray(userRolesFromSql.payload)) {
        userRolesFromSql.payload.forEach((item) => {
          if (item && item.roleName && item.roleName.length) {
            if (item.roleName && item.roleName.length) {
              userRoles.push(item.roleName);
            }
            if (item.roleIsPriviledged === 1) {
              isUserPriviledged = true;
            }
          }
        });
      }

      logToSystem('Verbose', `Login | RBAC Results for User | user: ${req.body.username} | role(s): ${JSON.stringify(userRoles)} | isUserPriviledged: ${isUserPriviledged}.`);

      // If user has at least one Role, it can login and we respond with a JWT token
      if (userRoles && userRoles.length > 0) {
        //   Create JWT token
        //   Return token
        createTokenSendResponse(
          checkedCreds.username, // Login name
          userRoles, // Array of Roles
          res,
          next
        );
        denyAccess = false;
      }
    }

    if (denyAccess) {
      // If NO
      //   Return error
      logToSystem('Error', 'Login | Denying access to user with HTTP Code 401.');
      res.status(401);
      const error = Error('Unable to login');
      next(error);
    }
  });
});

module.exports = router;
