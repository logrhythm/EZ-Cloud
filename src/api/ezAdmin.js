const express = require('express');

// Load the System Logging functions
const { logToSystem } = require('../shared/systemLogging');

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
  getDataFromMsSql,
  createMsSqlVariables,
  createMsSqlVariablesAndStoredProcParams,
  getDataFromPgSql,
  createPgSqlVariables
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
  if (
    process.env.databaseMode === 'mssql'
  ) {
    // Use MS SQL
    await getDataFromMsSql({
      targetVariable: usersList,
      query: `
      SELECT [rbacUserToRole].[id] AS 'userId'
        ,[rbacUserToRole].[login] AS 'userLogin'
        ,[rbacRoles].[uid] AS 'roleUid'
        ,[rbacRoles].[name] AS 'roleName'
        ,[rbacRoles].[isPrivileged] AS 'roleIsPrivileged'
      FROM [EZ].[dbo].[rbacRoles]
        RIGHT OUTER JOIN [EZ].[dbo].[rbacUserToRole] ON [rbacRoles].[uid] = [rbacUserToRole].[roleUid]
      ;
      `
    });
  } else {
    // Use PgSQL
    await getDataFromPgSql({
      targetVariable: usersList,
      query: `
      SELECT "rbacUserToRole"."id" AS "userId"
        ,"rbacUserToRole"."login" AS "userLogin"
        ,"rbacRoles"."uid" AS "roleUid"
        ,"rbacRoles"."name" AS "roleName"
        ,CASE
          WHEN
              "rbacRoles"."isPrivileged"=TRUE
              THEN 1
          ELSE
              0
      END AS "roleIsPrivileged"
        FROM "rbacRoles"
          RIGHT OUTER JOIN "rbacUserToRole" ON "rbacRoles"."uid" = "rbacUserToRole"."roleUid"
      ;
    `
    });
  }

  res.json(usersList);
});

// ##########################################################################################
// UpdateUser
// ##########################################################################################

router.post('/UpdateUser', async (req, res) => {
  const updatedUser = {};

  if (req.body.userId == null) {
    logToSystem('Verbose', `Admin | Attempting to create User Account | Login: ${req.body.userLogin} | Role UID: ${req.body.roleUid} | user: ${(req.user.username ? req.user.username : '-')}`);
  }
  if (req.body.userId != null) {
    logToSystem('Verbose', `Admin | Attempting to update User Account | User ID: ${req.body.userId} | Role UID: ${req.body.roleUid} | user: ${(req.user.username ? req.user.username : '-')}`);
  }

  if (
    process.env.databaseMode === 'mssql'
  ) {
    // Use MS SQL

    const [sqlVariables, storedProcedureParams] = createMsSqlVariablesAndStoredProcParams(
      req,
      [
        { name: 'userId', type: 'Int' },
        { name: 'userLogin', type: 'NVarChar' },
        { name: 'roleUid', type: 'NVarChar' },
        { name: 'userPassword', type: 'NVarChar' }
      ],
      true
    );

    await getDataFromMsSql({
      targetVariable: updatedUser,
      query: `
      EXECUTE [dbo].[upsert_RBAC_User]
        ${storedProcedureParams.join(', ')}
        ;
      `,
      variables: sqlVariables
    });
  } else {
    // Use PgSQL

    await getDataFromPgSql({
      targetVariable: updatedUser,
      query: `
      CALL "upsert_RBAC_User"
        (
          $1, -- userId
          $2, -- userLogin
          $3, -- roleUid
          $4  -- userPassword
        )
        ;
      `,
      variables: createPgSqlVariables(
        req,
        [
          { name: 'userId' },
          { name: 'userLogin' },
          { name: 'roleUid' },
          { name: 'userPassword' }
        ]
      )
    });
  }

  if (req.body.userId == null) { // User creation
    if (
      updatedUser
      && !(
        updatedUser.errors
        && Array.isArray(updatedUser.errors)
        && updatedUser.errors.length
      )
    ) { // 🎉
      logToSystem('Information', `Admin | User Account created | Login: ${req.body.userLogin} | Role UID: ${req.body.roleUid} | user: ${(req.user.username ? req.user.username : '-')}`);
    } else { // 😥
      logToSystem('Warning', `Admin | Failed to create User Account | Login: ${req.body.userLogin} | Role UID: ${req.body.roleUid} | user: ${(req.user.username ? req.user.username : '-')} | Details: ${JSON.stringify(updatedUser)}`);
    }
  }

  if (req.body.userId != null) { // User update
    if (
      updatedUser
      && !(
        updatedUser.errors
        && Array.isArray(updatedUser.errors)
        && updatedUser.errors.length
      )
    ) { // 🎉
      logToSystem('Information', `Admin | User Account updated | User ID: ${req.body.userId} | Role UID: ${req.body.roleUid} | user: ${(req.user.username ? req.user.username : '-')}`);
    } else { // 😥
      logToSystem('Warning', `Admin | Fail to update User Account | User ID: ${req.body.userId} | Role UID: ${req.body.roleUid} | user: ${(req.user.username ? req.user.username : '-')} | Details: ${JSON.stringify(updatedUser)}`);
    }
  }

  res.json(updatedUser);
});

// ##########################################################################################
// DeleteUser
// ##########################################################################################

router.post('/DeleteUser', async (req, res) => {
  const deletedUser = {};

  logToSystem('Verbose', `Admin | Attempting to delete User Account | User ID: ${req.body.userId} | user: ${(req.user.username ? req.user.username : '-')}`);

  if (
    process.env.databaseMode === 'mssql'
  ) {
    // Use MS SQL
    await getDataFromMsSql({
      targetVariable: deletedUser,
      query: `
      EXECUTE [dbo].[delete_RBAC_User]
       @userId
      ;
      `,
      variables: createMsSqlVariables(
        req,
        [
          { name: 'userId', type: 'Int' }
        ]
      )
    });
  } else {
    // Use PgSQL
    await getDataFromPgSql({
      targetVariable: deletedUser,
      query: `
      CALL "delete_RBAC_User"
      (
         $1
      );
      `,
      variables: createPgSqlVariables(
        req,
        [
          { name: 'userId' }
        ]
      )
    });
  }

  if (
    deletedUser
    && !(
      deletedUser.errors
      && Array.isArray(deletedUser.errors)
      && deletedUser.errors.length
    )
  ) { // 🎉 💀 🪓🪓🪓🪓 😈
    logToSystem('Information', `Admin | User Account deleted | User ID: ${req.body.userId} | user: ${(req.user.username ? req.user.username : '-')}`);
  } else { // 😥
    logToSystem('Warning', `Admin | Failed to delete User Account | User ID: ${req.body.userId} | user: ${(req.user.username ? req.user.username : '-')} | Details: ${JSON.stringify(deletedUser)}`);
  }

  res.json(deletedUser);
});

// ##########################################################################################
// GetRolesList
// ##########################################################################################

router.get('/GetRolesList', async (req, res) => {
  const rolesList = {};
  if (
    process.env.databaseMode === 'mssql'
  ) {
    // Use MS SQL
    await getDataFromMsSql({
      targetVariable: rolesList,
      query: `
        SELECT [uid] AS 'roleUid'
        ,[name] AS 'roleName'
        ,[isPrivileged] AS 'roleIsPrivileged'
      FROM [EZ].[dbo].[rbacRoles]
      `
    });
  } else {
    // Use PgSQL
    await getDataFromPgSql({
      targetVariable: rolesList,
      query: `
      SELECT "uid" AS "roleUid"
        ,"name" AS "roleName"
        ,CASE
          WHEN
              "isPrivileged"=TRUE
              THEN 1
          ELSE
              0
      END AS "roleIsPrivileged"
      FROM "rbacRoles"
    `
    });
  }

  res.json(rolesList);
});

// ##########################################################################################
// UpdateRole
// ##########################################################################################

router.post('/UpdateRole', async (req, res) => {
  const updatedRole = {};

  logToSystem('Verbose', `Admin | Attempting to create/update User Role | Role UID: ${req.body.uid} | Role Name: ${req.body.name} | Is Role Privileged: ${(req.body.isPrivileged === 1 ? 'Privileged' : 'Not privileged')} | user: ${(req.user.username ? req.user.username : '-')}`);

  if (
    process.env.databaseMode === 'mssql'
  ) {
    // Use MS SQL
    await getDataFromMsSql({
      targetVariable: updatedRole,
      query: `
      EXECUTE [dbo].[upsert_RBAC_Role]
         @uid
        ,@name
        ,@isPrivileged
        ;
      `,
      variables: createMsSqlVariables(
        req,
        [
          { name: 'uid', type: 'NVarChar' },
          { name: 'name', type: 'NVarChar' },
          { name: 'isPrivileged', type: 'TinyInt' }
        ]
      )
    });
  } else {
    // Use PgSQL
    await getDataFromPgSql({
      targetVariable: updatedRole,
      query: `
      CALL "upsert_RBAC_Role"
      (
         $1
        ,$2
        ,$3 = 1
      );
      `,
      variables: createPgSqlVariables(
        req,
        [
          { name: 'uid' },
          { name: 'name' },
          { name: 'isPrivileged' }
        ]
      )
    });
  }

  if (
    updatedRole
    && !(
      updatedRole.errors
      && Array.isArray(updatedRole.errors)
      && updatedRole.errors.length
    )
  ) { // 🎉 💀 🪓🪓🪓🪓 😈
    logToSystem('Information', `Admin | User Role created/updated | Role UID: ${req.body.uid} | Role Name: ${req.body.name} | Is Role Privileged: ${(req.body.isPrivileged === 1 ? 'Privileged' : 'Not privileged')} | user: ${(req.user.username ? req.user.username : '-')}`);
  } else { // 😥
    logToSystem('Warning', `Admin | Failed to create/update User Role | Role UID: ${req.body.uid} | Role Name: ${req.body.name} | Is Role Privileged: ${(req.body.isPrivileged === 1 ? 'Privileged' : 'Not privileged')} | user: ${(req.user.username ? req.user.username : '-')} | Details: ${JSON.stringify(updatedRole)}`);
  }

  res.json(updatedRole);
});

// ##########################################################################################
// DeleteRole
// ##########################################################################################

router.post('/DeleteRole', async (req, res) => {
  const deletedRole = {};

  logToSystem('Verbose', `Admin | Attempting to delete User Role | Role UID: ${req.body.uid} | user: ${(req.user.username ? req.user.username : '-')}`);

  if (
    process.env.databaseMode === 'mssql'
  ) {
    // Use MS SQL
    await getDataFromMsSql({
      targetVariable: deletedRole,
      query: `
      EXECUTE [dbo].[delete_RBAC_Role]
       @uid
        ;
      `,
      variables: createMsSqlVariables(
        req,
        [
          { name: 'uid', type: 'NVarChar' }
        ]
      )
    });
  } else {
    // Use PgSQL
    await getDataFromPgSql({
      targetVariable: deletedRole,
      query: `
      CALL "delete_RBAC_Role"
      (
         $1
      );
      `,
      variables: createPgSqlVariables(
        req,
        [
          { name: 'uid' }
        ]
      )
    });
  }

  if (
    deletedRole
    && !(
      deletedRole.errors
      && Array.isArray(deletedRole.errors)
      && deletedRole.errors.length
    )
  ) { // 🎉 💀 🪓🪓🪓🪓 😈
    logToSystem('Information', `Admin | User Role deleted | Role UID: ${req.body.uid} | user: ${(req.user.username ? req.user.username : '-')}`);
  } else { // 😥
    logToSystem('Warning', `Admin | Failed to delete User Role | Role UID: ${req.body.uid} | user: ${(req.user.username ? req.user.username : '-')} | Details: ${JSON.stringify(deletedRole)}`);
  }

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
