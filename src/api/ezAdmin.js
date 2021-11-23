const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - ezAdmin - All good'
  });
});

//        ##     ## ######## #### ##       #### ######## #### ########  ######
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ######    ######
//        ##     ##    ##     ##  ##        ##     ##     ##  ##             ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//         #######     ##    #### ######## ####    ##    #### ########  ######

const {
  getDataFromSql,
  createSqlVariables
} = require('../shared/sqlUtils');

//        ########   #######  ##     ## ######## ########  ######
//        ##     ## ##     ## ##     ##    ##    ##       ##    ##
//        ##     ## ##     ## ##     ##    ##    ##       ##
//        ########  ##     ## ##     ##    ##    ######    ######
//        ##   ##   ##     ## ##     ##    ##    ##             ##
//        ##    ##  ##     ## ##     ##    ##    ##       ##    ##
//        ##     ##  #######   #######     ##    ########  ######

// None so far
// GetUsersList
// UpdateUser
// GetRolesList
// UpdateRole

// ##########################################################################################
// GetUsersList
// ##########################################################################################

router.get('/GetUsersList', async (req, res) => {
  const usersList = {};
  await getDataFromSql({
    targetVariable: usersList,
    query: `
    SELECT [rbacUserToRole].[id] AS 'userId'
      ,[rbacUserToRole].[login] AS 'userLogin'
      ,[rbacRoles].[uid] AS 'roleUid'
      ,[rbacRoles].[name] AS 'roleName'
      ,[rbacRoles].[isPriviledged] AS 'roleIsPriviledged'
    FROM [EZ].[dbo].[rbacRoles]
      INNER JOIN [EZ].[dbo].[rbacUserToRole] ON [rbacRoles].[uid] = [rbacUserToRole].[roleUid]
  `
  });

  res.json(usersList);
});

// ##########################################################################################
// UpdateUser
// ##########################################################################################

router.post('/UpdateUser', async (req, res) => {
  const updatedUser = {};

  await getDataFromSql({
    targetVariable: updatedUser,
    query: `
    EXECUTE [dbo].[upsert_RBAC_User]
       @userId
      ,@userLogin
      ,@roleUid
      ,@userPassword
      ;
    `,
    variables: createSqlVariables(
      req,
      [
        { name: 'userId', type: 'Int' },
        { name: 'userLogin', type: 'NVarChar' },
        { name: 'roleUid', type: 'NVarChar' },
        { name: 'userPassword', type: 'NVarChar' }
      ]
    )
  });

  res.json(updatedUser);
});

// ##########################################################################################
// DeleteUser
// ##########################################################################################

router.post('/DeleteUser', async (req, res) => {
  const deletedUser = {};

  await getDataFromSql({
    targetVariable: deletedUser,
    query: `
    EXECUTE [dbo].[delete_RBAC_User]
       @userId
      ;
    `,
    variables: createSqlVariables(
      req,
      [
        { name: 'userId', type: 'Int' }
      ]
    )
  });

  res.json(deletedUser);
});

// ##########################################################################################
// GetRolesList
// ##########################################################################################

router.get('/GetRolesList', async (req, res) => {
  const rolesList = {};
  await getDataFromSql({
    targetVariable: rolesList,
    query: `
    SELECT [uid] AS 'roleUid'
      ,[name] AS 'roleName'
      ,[isPriviledged] AS 'roleIsPriviledged'
    FROM [EZ].[dbo].[rbacRoles]
  `
  });

  res.json(rolesList);
});

// ##########################################################################################
// UpdateRole
// ##########################################################################################

router.post('/UpdateRole', async (req, res) => {
  const updatedRole = {};

  await getDataFromSql({
    targetVariable: updatedRole,
    query: `
    EXECUTE [dbo].[upsert_RBAC_Role]
       @uid
      ,@name
      ,@isPriviledged
      ;
    `,
    variables: createSqlVariables(
      req,
      [
        { name: 'uid', type: 'NVarChar' },
        { name: 'name', type: 'NVarChar' },
        { name: 'isPriviledged', type: 'TinyInt' }
      ]
    )
  });

  res.json(updatedRole);
});

// ##########################################################################################
// DeleteRole
// ##########################################################################################

router.post('/DeleteRole', async (req, res) => {
  const deletedRole = {};

  await getDataFromSql({
    targetVariable: deletedRole,
    query: `
    EXECUTE [dbo].[delete_RBAC_Role]
       @uid
      ;
    `,
    variables: createSqlVariables(
      req,
      [
        { name: 'uid', type: 'Int' }
      ]
    )
  });

  res.json(deletedRole);
});

//        ######## ##     ## ########   #######  ########  ########  ######
//        ##        ##   ##  ##     ## ##     ## ##     ##    ##    ##    ##
//        ##         ## ##   ##     ## ##     ## ##     ##    ##    ##
//        ######      ###    ########  ##     ## ########     ##     ######
//        ##         ## ##   ##        ##     ## ##   ##      ##          ##
//        ##        ##   ##  ##        ##     ## ##    ##     ##    ##    ##
//        ######## ##     ## ##         #######  ##     ##    ##     ######

module.exports = {
  ezAdmin: router
};
