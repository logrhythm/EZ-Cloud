-- =============================================
-- Author:		  Tony Massé
-- Create date: 2021-11-11
-- =============================================

-- Create the EZ Admin User
USE [master]
GO
IF NOT EXISTS 
    (SELECT name  
     FROM master.sys.server_principals
     WHERE name = 'ezAdmin' AND default_database_name = 'EZ')
BEGIN
    CREATE LOGIN [ezAdmin] WITH PASSWORD=N'CHANGE_ME', DEFAULT_DATABASE=[EZ], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF
END

-- Add the EZ Admin User to the EZ database
USE [EZ]
GO
IF NOT EXISTS 
    (SELECT name
     FROM sys.database_principals
     WHERE name = 'ezAdmin')
BEGIN
    CREATE USER [ezAdmin] FOR LOGIN [ezAdmin]
END
ELSE
BEGIN
    -- Drop the old one first, as it's likely the SID are different
    DROP USER [ezAdmin]
    CREATE USER [ezAdmin] FOR LOGIN [ezAdmin]
END
GO

