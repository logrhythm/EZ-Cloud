DROP PROCEDURE IF EXISTS [dbo].[delete_RBAC_User]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-11-22
-- Update date: 2022-08-03 - To add `EZ_VERSION` flag
-- EZ_VERSION: 20211122.01 :EZ_VERSION
-- =============================================
CREATE PROCEDURE delete_RBAC_User 
	@userID int = NULL -- If none is provided, we just do nothing
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	IF @userID IS NOT NULL
	BEGIN
		IF EXISTS 
			(SELECT *
				FROM [dbo].[rbacUserToRole]
				WHERE [id] = @userID)
			BEGIN
				DECLARE @sqlStatement nvarchar(max)

				-- Get @userLogin for specific @userId
				DECLARE @userLogin nvarchar(500)
				SELECT @userLogin = [login]
					FROM [dbo].[rbacUserToRole]
					WHERE [id] = @userID

				-- Delete record for User in [rbacUserToRole]
				DELETE FROM [dbo].[rbacUserToRole] WHERE [login] = @userLogin

				-- Trash the USER mapping in [EZ]
				IF EXISTS 
					(SELECT name
						FROM sys.database_principals
						WHERE name = @userLogin)
				BEGIN
					SET @sqlStatement = N'DROP USER ' + QUOTENAME(@userLogin)
					EXEC (@sqlStatement)
					SET @sqlStatement = N''
				END

				-- Delete the User login
				IF EXISTS 
					(SELECT name  
						FROM master.sys.server_principals
						WHERE name = @userLogin AND default_database_name = 'EZ')
				BEGIN
					SET @sqlStatement = N'DROP LOGIN ' + QUOTENAME(@userLogin)
					EXEC (@sqlStatement)
					SET @sqlStatement = N''
				END
			END
	END
END;
GO

-- -- Tests
-- -- 

-- USE [EZ]
-- GO

-- DECLARE @RC int

-- -- Should do nothing:

-- EXECUTE @RC = [dbo].[delete_RBAC_User] 
--    NULL

-- SELECT @RC;
-- GO

-- -- Assuming the User has ID 3:

-- DECLARE @RC int

-- EXECUTE @RC = [dbo].[delete_RBAC_User] 
--    3
-- SELECT @RC;
-- GO
