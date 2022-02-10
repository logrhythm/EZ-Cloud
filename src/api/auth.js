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

const { encryptStringWithRsaPublicKey } = require('../shared/crypto');

const ezMarketConfig = JSON.parse(fs.readFileSync(path.join(process.env.baseDirname, 'config', 'ez-market-place.json'), 'utf8'));
const deploymentUid = ezMarketConfig.deploymentUid || '';
const ezMarketServer = ezMarketConfig.server || {};

// Get JWT Secret and TTL
const jwtConfig = JSON.parse(fs.readFileSync(path.join(process.env.baseDirname, 'config', 'jwt.json'), 'utf8'));
const jwtSecret = (jwtConfig && jwtConfig.secret ? jwtConfig.secret : '');
const jwtTtl = (jwtConfig && jwtConfig.ttl ? jwtConfig.ttl : '1h');

/**
 * Create the JWT Token and sends it via res
 * @param {String} user User login
 * @param {Array} roles List of the users's Roles
 * @param {Boolean} isUserPrivileged True if the user is part of a Privileged Role
 * @param {String} publisherUid User's Publisher UID
 * @param {BigInteger} masterId SIEM Master ID
 * @param {*} res Express Router's response
 * @param {*} next Express Router's Next function
 */
const createTokenSendResponse = (
  user,
  roles,
  isUserPrivileged,
  publisherUid,
  masterId,
  res,
  next
) => {
  const payload = {
    username: user || '',
    roles: roles || [],
    isPrivileged: (isUserPrivileged === true) || false
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
          outputs: [], // array of all the outputs
          deployment: {
            uid: deploymentUid, // string with the Deployment UID
            version: process.env.VERSION
          },
          publisher: {
            publisherUid, // string with the Publisher UID
            ezMarketUid: encryptStringWithRsaPublicKey(`${deploymentUid}:${publisherUid}:${masterId}`)
          }
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
      logToSystem('Information', `Login | Credentials for User are valid | user: ${req.body.username}`);

      // Get the Roles for the User
      const userRolesFromSql = {};
      const userRoles = [];
      let isUserPrivileged = false;
      let publisherUid = '';
      let masterId = 0;

      await getDataFromSql({
        targetVariable: userRolesFromSql,
        query: `
        SELECT -- [rbacUserToRole].[id] AS 'userID'
          [rbacUserToRole].[login] AS 'userLogin'
          -- ,[rbacRoles].[uid] AS 'roleUid'
          ,[rbacRoles].[name] AS 'roleName'
          ,[rbacRoles].[isPrivileged] AS 'roleIsPrivileged'
          ,[rbacUserToRole].[publisherUid] AS 'publisherUid'
          ,[get_SIEM_Master_ID].[MasterID] AS 'masterId'
        FROM [EZ].[dbo].[rbacRoles]
          RIGHT OUTER JOIN [EZ].[dbo].[rbacUserToRole] ON [rbacRoles].[uid] = [rbacUserToRole].[roleUid]
          LEFT OUTER JOIN [EZ].[dbo].[get_SIEM_Master_ID] ON [get_SIEM_Master_ID].[MasterID] IS NOT NULL
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
            if (item.roleIsPrivileged === 1) {
              isUserPrivileged = true;
            }
            // Grab the Publisher UID
            publisherUid = item.publisherUid;
            // Grab the SIEM Master ID
            masterId = item.masterId;
          }
        });
      }

      logToSystem('Information', `Login | RBAC Results for User | user: ${req.body.username} | role(s): ${JSON.stringify(userRoles)} | isUserPrivileged: ${isUserPrivileged}`);

      // If user has at least one Role, it can login and we respond with a JWT token
      if (userRoles && userRoles.length > 0) {
        //   Create JWT token
        //   Return token
        createTokenSendResponse(
          checkedCreds.username, // Login name
          userRoles, // Array of Roles
          isUserPrivileged, // True or False
          publisherUid, // The Publisher UID assigned to the User
          masterId, // The SIEM Master ID
          res,
          next
        );
        denyAccess = false;
      }
    } else {
      logToSystem('Information', `Login | Credentials for User are invalid | user: ${req.body.username}`);
    }

    if (denyAccess) {
      // If NO
      //   Return error
      logToSystem('Error', `Login | Denying access to user with HTTP Code 401. | user: ${(req.body.username ? req.body.username : '-')}`);
      res.status(401);
      const error = Error('Unable to login');
      next(error);
    }
  });
});

module.exports = router;
