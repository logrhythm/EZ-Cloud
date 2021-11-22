DROP PROCEDURE IF EXISTS [dbo].[upsert_RBAC_User]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		  Tony Massé
-- Create date: 2021-11-22
-- =============================================
CREATE PROCEDURE upsert_RBAC_User 
	@userID int = NULL, -- If none is provided, we create a new User
	@userLogin nvarchar(500),
	@roleUid varchar(40),
	@password nvarchar(max) = NULL -- Only used when creating a new User
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- WORKFLOW:
	-- If userID is NULL, then:
	-- - create the User in SQL
	-- If userLogin exists as an SQL User and is already in rbacUserToToles:
	-- - update the entry in rbacUserToToles
	-- If userLogin exists as an SQL User and is not yet in rbacUserToToles:
	-- - add an entry in rbacUserToToles

	DECLARE @sqlStatement nvarchar(max)

	-- If userID is NULL, then:
	-- - create the User in SQL
	IF @userID IS NULL
	BEGIN
		IF NOT EXISTS 
			(SELECT name  
				FROM master.sys.server_principals
				WHERE name = @userLogin AND default_database_name = 'EZ')
		BEGIN
			SET @sqlStatement = N'CREATE LOGIN ' + QUOTENAME(@userLogin) + N' WITH PASSWORD=N' + QUOTENAME(ISNULL(@password,''), '''') + N', DEFAULT_DATABASE=[EZ], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF'
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
	END

	-- If userLogin exists as an SQL User and is already in rbacUserToToles:
	-- - update the entry in rbacUserToToles
	-- If userLogin exists as an SQL User and is not yet in rbacUserToToles:
	-- - add an entry in rbacUserToToles
	IF EXISTS 
		(SELECT name
		FROM sys.database_principals
		WHERE name = @userLogin)
	BEGIN
		PRINT '@userLogin EXISTS'
		IF EXISTS 
			(SELECT *
				FROM [dbo].[rbacUserToRole]
				WHERE [id] = @userID)
			BEGIN
				PRINT 'UPDATE @userLogin'
				UPDATE [dbo].[rbacUserToRole]
					SET 
						-- [login] = @userLogin, -- We do not allow for login/user rename
						[roleUid] = @roleUid
					WHERE [id] = @userID;
			END
		ELSE
			BEGIN
				PRINT 'INSERT @userLogin'
				INSERT INTO [dbo].[rbacUserToRole]
				([login], [roleUid]) VALUES (@userLogin, @roleUid)
			END
	END
	ELSE
		PRINT '@userLogin DOES NOT EXISTS'

END;
GO

-- Tests
-- 
/*
USE [EZ]
GO

DECLARE @RC int

EXECUTE @RC = [dbo].[upsert_RBAC_User] 
   NULL
  ,'billoutte'
  ,'cb36e823-e68f-46aa-9dc1-71c35cae43b5' -- User
  ,'P4s$word!'

SELECT @RC;
GO

-- Assuming this created new User with ID 3

DECLARE @RC int

EXECUTE @RC = [dbo].[upsert_RBAC_User] 
   3
  ,'billoutte'
  ,'b7972c45-3546-4993-93ab-c0f1d9a0ffae' -- Admin
  ,NULL
SELECT @RC;
GO

-- Clean up
USE [EZ]
GO
DELETE FROM [dbo].[rbacUserToRole] WHERE [login] = 'billoutte'
DROP USER [billoutte]
DROP LOGIN [billoutte]

*/