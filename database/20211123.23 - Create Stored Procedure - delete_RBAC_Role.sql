DROP PROCEDURE IF EXISTS [dbo].[delete_RBAC_Role]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-11-23
-- Update date: 2022-08-03 - To add `EZ_VERSION` flag
-- EZ_VERSION: 20211123.01 :EZ_VERSION
-- =============================================
CREATE PROCEDURE delete_RBAC_Role 
	@uid varchar(40) = NULL -- If none is provided, we just do nothing
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	IF @uid IS NOT NULL
	BEGIN
		-- Delete record for Role in [rbacRoles]
		DELETE FROM [dbo].[rbacRoles] WHERE [uid] = @uid
	END
END;
GO

-- -- Tests
-- -- 

-- USE [EZ]
-- GO

-- DECLARE @RC int

-- -- Should do nothing:

-- EXECUTE @RC = [dbo].[delete_RBAC_Role] 
--    NULL

-- SELECT @RC;
-- GO

-- -- Assuming the Role has UID :

-- DECLARE @RC int

-- EXECUTE @RC = [dbo].[delete_RBAC_Role] 
--    '88b3cd68-0086-425f-bbd3-1518b93c07dc'
-- SELECT @RC;
-- GO
