DROP PROCEDURE IF EXISTS [dbo].[upsert_RBAC_User]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-11-22
-- Update date: 2021-11-23 - To make @userLogin optional, rename @password into @userPassword and load userLogin from table when updating the user details (as opposed to create a new user)
-- Update date: 2021-11-24 - Update to deal with non EZ accounts
-- Update date: 2022-08-03 - To add `EZ_VERSION` flag
-- EZ_VERSION: 20211124.01 :EZ_VERSION
-- =============================================
CREATE PROCEDURE upsert_RBAC_User 
	@userID int = NULL, -- If none is provided, we create a new User
	@userLogin nvarchar(500) = NULL, -- Only used when creating a new User
	@roleUid varchar(40),
	@userPassword nvarchar(max) = NULL -- Only used when creating a new User
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- WORKFLOW:
	-- If userID is NULL, then:
	-- - double check the Login doesn't already exist in SQL (for any DB, as we do not want to mess with existing accounts)
	-- - if Login not found anywhere:
	-- -- create the User in SQL
	-- If userLogin exists as an SQL User and is already in rbacUserToToles:
	-- - update the entry in rbacUserToToles
	-- If userLogin exists as an SQL User and is not yet in rbacUserToToles:
	-- - add an entry in rbacUserToToles

	DECLARE @sqlStatement nvarchar(max)
	DECLARE @tempUserLogin nvarchar(500)

	-- If userID is NULL, then:
	-- - create the User in SQL
	IF @userID IS NULL
	BEGIN
		-- Double checking the Login doesn't already exist in SQL (for any DB, as we do not want to mess with existing accounts)
		IF NOT EXISTS
			(SELECT name  
				FROM master.sys.server_principals
				WHERE name = @userLogin)
		BEGIN
			SET @sqlStatement = N'CREATE LOGIN ' + QUOTENAME(@userLogin) + N' WITH PASSWORD=N' + QUOTENAME(ISNULL(@userPassword,''), '''') + N', DEFAULT_DATABASE=[EZ], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF'
			EXEC (@sqlStatement)
			SET @sqlStatement = N''

			IF NOT EXISTS 
				(SELECT name
					FROM sys.database_principals
					WHERE name = @userLogin)
			BEGIN
				SET @sqlStatement = N'CREATE USER ' + QUOTENAME(@userLogin) + N' FOR LOGIN ' + QUOTENAME(@userLogin)
				EXEC (@sqlStatement)
				SET @sqlStatement = N''
			END
			ELSE
			BEGIN
				-- Drop the old one first, as it's likely the SIDs are different
				SET @sqlStatement = N'DROP USER ' + QUOTENAME(@userLogin) + N'
				CREATE USER ' + QUOTENAME(@userLogin) + N' FOR LOGIN ' + QUOTENAME(@userLogin)
				EXEC (@sqlStatement)
				SET @sqlStatement = N''
			END
		END
		ELSE
		BEGIN
			PRINT 'ERROR - User already exists: ' + QUOTENAME(@userLogin);
			PRINT 'INFO - EZ Server only allows using non already exisiting User Login';
			THROW 51001, 'User Login already exists. EZ Server only uses new User Login.', 1;
		END
		-- As we came here with OUT a userId, we use the userLogin from the parameter
		SET @tempUserLogin = @userLogin
	END
	ELSE
	BEGIN
		-- As we came here WITH a userId, we use the userLogin from the Table, based on the userId
		SELECT @tempUserLogin = [login]
			FROM [dbo].[rbacUserToRole]
			WHERE [id] = @userID
	END

	-- If userLogin exists as an SQL User and is already in rbacUserToToles:
	-- - update the entry in rbacUserToToles
	-- If userLogin exists as an SQL User and is not yet in rbacUserToToles:
	-- - add an entry in rbacUserToToles
	IF EXISTS 
		(SELECT name
		FROM sys.database_principals
		WHERE name = @tempUserLogin)
	BEGIN
		IF EXISTS 
			(SELECT *
				FROM [dbo].[rbacUserToRole]
				WHERE [id] = @userID)
			BEGIN
				UPDATE [dbo].[rbacUserToRole]
					SET 
						-- [login] = @tempUserLogin, -- We do not allow for login/user rename
						[roleUid] = @roleUid
					WHERE [id] = @userID;
			END
		ELSE
			BEGIN
				INSERT INTO [dbo].[rbacUserToRole]
				([login], [roleUid]) VALUES (@tempUserLogin, @roleUid)
			END
	END

END;
GO

-- -- Tests
-- -- 

-- USE [EZ]
-- GO

-- DECLARE @RC int

-- EXECUTE @RC = [dbo].[upsert_RBAC_User] 
--    NULL
--   ,'billoutte'
--   ,'cb36e823-e68f-46aa-9dc1-71c35cae43b5' -- User
--   ,'P4s$word!'

-- SELECT @RC;
-- GO

-- -- Assuming this created new User with ID 3

-- DECLARE @RC int

-- EXECUTE @RC = [dbo].[upsert_RBAC_User] 
--    3
--   ,'billoutte'
--   ,'b7972c45-3546-4993-93ab-c0f1d9a0ffae' -- Admin
--   ,NULL
-- SELECT @RC;
-- GO

-- -- Clean up
-- USE [EZ]
-- GO
-- DELETE FROM [dbo].[rbacUserToRole] WHERE [login] = 'billoutte'
-- DROP USER [billoutte]
-- DROP LOGIN [billoutte]
