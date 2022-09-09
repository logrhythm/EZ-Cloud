-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-11-11
-- Modified on: 2022-07-29 - To create `ocAdmin` instead of `ezAdmin`
-- =============================================

-- Create the OC Admin User
USE [master]
GO
IF NOT EXISTS 
    (SELECT name  
     FROM master.sys.server_principals
     WHERE name = 'ocAdmin' AND default_database_name = 'EZ')
BEGIN
    CREATE LOGIN [ocAdmin] WITH PASSWORD=N'CHANGE_ME', DEFAULT_DATABASE=[EZ], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF
END

-- Add the OC Admin User to the EZ database
USE [EZ]
GO
IF NOT EXISTS 
    (SELECT name
     FROM sys.database_principals
     WHERE name = 'ocAdmin')
BEGIN
    CREATE USER [ocAdmin] FOR LOGIN [ocAdmin]
END
ELSE
BEGIN
    -- Drop the old one first, as it's likely the SID are different
    DROP USER [ocAdmin]
    CREATE USER [ocAdmin] FOR LOGIN [ocAdmin]
END
GO

