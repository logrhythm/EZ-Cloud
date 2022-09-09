DROP PROCEDURE IF EXISTS [dbo].[upsert_RBAC_Role]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-11-23
-- Update date: 2021-12-17 - To rename the [isPrivileged] column into [isPrivileged]
-- Update date: 2022-08-03 - To add `EZ_VERSION` flag
-- EZ_VERSION: 20211217.01 :EZ_VERSION
-- =============================================
CREATE PROCEDURE upsert_RBAC_Role 
	@uid varchar(40),
	@name nvarchar(200),
	@isPrivileged tinyint = 0 -- Default to FALSE
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- WORKFLOW:
	-- If Role's uid is already in rbacRoles:
	-- - update the entry in rbacRoles
	-- Else:
	-- - add an entry in rbacRoles

	IF EXISTS 
		(SELECT *
			FROM [dbo].[rbacRoles]
			WHERE [uid] = @uid)
		BEGIN
			UPDATE [dbo].[rbacRoles]
				SET 
					[name] = @name,
					[isPrivileged] = @isPrivileged
				WHERE [uid] = @uid;
		END
	ELSE
		BEGIN
			INSERT INTO [dbo].[rbacRoles]
			([uid], [name], [isPrivileged]) VALUES (@uid, @name, @isPrivileged)
		END

END;
GO

-- -- Tests

-- USE [EZ]
-- GO

-- DECLARE @RC int

-- EXECUTE @RC = [dbo].[upsert_RBAC_Role] 
--   '88b3cd68-0086-425f-bbd3-1518b93c07dc'
--   ,'Role Name - Default Priviledge'
--   -- Missing isPrivileged, shoudl default to FALSE

-- SELECT @RC;
-- SELECT * FROM [dbo].[rbacRoles] WHERE [uid] = '88b3cd68-0086-425f-bbd3-1518b93c07dc'
-- GO

-- -- Create a proper User Role

-- DECLARE @RC int

-- EXECUTE @RC = [dbo].[upsert_RBAC_Role] 
--   'c980e997-dea2-4c72-bca0-bac9bfa9db98'
--   ,'Role Name - User Priviledge'
--   ,0 -- User

-- SELECT @RC;
-- SELECT * FROM [dbo].[rbacRoles] WHERE [uid] = 'c980e997-dea2-4c72-bca0-bac9bfa9db98'
-- GO

-- -- Create a proper Admin Role

-- DECLARE @RC int

-- EXECUTE @RC = [dbo].[upsert_RBAC_Role] 
--   '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3'
--   ,'Role Name - Admin Priviledge'
--   ,1 -- Admin

-- SELECT @RC;
-- SELECT * FROM [dbo].[rbacRoles] WHERE [uid] = '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3'
-- GO

-- -- Update Admin Role's name

-- DECLARE @RC int

-- EXECUTE @RC = [dbo].[upsert_RBAC_Role] 
--   '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3'
--   ,'Role Name - Admin Priviledge - Updated'
--   ,1 -- Admin

-- SELECT @RC;
-- SELECT * FROM [dbo].[rbacRoles] WHERE [uid] = '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3'
-- GO

-- -- Update Admin Role's priviledge

-- DECLARE @RC int

-- EXECUTE @RC = [dbo].[upsert_RBAC_Role] 
--   '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3'
--   ,'Role Name - Admin Priviledge - Updated - Downgraded'
--   ,0 -- User

-- SELECT @RC;
-- SELECT * FROM [dbo].[rbacRoles] WHERE [uid] = '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3'
-- GO

-- -- Clean up
-- USE [EZ]
-- GO
-- DELETE FROM [dbo].[rbacRoles] WHERE [uid] = '88b3cd68-0086-425f-bbd3-1518b93c07dc'
-- DELETE FROM [dbo].[rbacRoles] WHERE [uid] = 'c980e997-dea2-4c72-bca0-bac9bfa9db98'
-- DELETE FROM [dbo].[rbacRoles] WHERE [uid] = '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3'
-- GO
