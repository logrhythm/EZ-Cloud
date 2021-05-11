DROP PROCEDURE [dbo].[upsert_openCollector]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		  Tony Massé
-- Create date: 2021-05-10
-- =============================================
CREATE PROCEDURE upsert_openCollector 
	@uid varchar(50),
	@name nvarchar(50),
	@hostname nvarchar(50),
	@port int = 0,
	@authenticationMethod nvarchar(15),
	@username nvarchar(100),
	@password nvarchar(250),
	@privateKey nvarchar(max),
	@osVersion nvarchar(100),
	@ocInstalled tinyint,
	@ocVersion nvarchar(100),
	@fbInstalled tinyint,
	@fbVersion nvarchar(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
  IF EXISTS (SELECT *
    FROM openCollectors
    WHERE uid = @uid)
	  IF @password = N'** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **' AND @privateKey = N'** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **'
		  UPDATE [dbo].[openCollectors]
			SET 
			  [name] = @name
			  ,[hostname] = @hostname
			  ,[port] = @port
			  ,[authenticationMethod] = @authenticationMethod
			  ,[username] = @username
			  --,[password] = @password
			  --,[privateKey] = @privateKey
			  ,[osVersion] = @osVersion
			  ,[ocInstalled] = @ocInstalled
			  ,[ocVersion] = @ocVersion
			  ,[fbInstalled] = @fbInstalled
			  ,[fbVersion] = @fbVersion
		  WHERE uid = @uid;
		ELSE
			IF @password = N'** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **'
			  UPDATE [dbo].[openCollectors]
				SET 
				  [name] = @name
				  ,[hostname] = @hostname
				  ,[port] = @port
				  ,[authenticationMethod] = @authenticationMethod
				  ,[username] = @username
				  --,[password] = @password
				  ,[privateKey] = @privateKey
				  ,[osVersion] = @osVersion
				  ,[ocInstalled] = @ocInstalled
				  ,[ocVersion] = @ocVersion
				  ,[fbInstalled] = @fbInstalled
				  ,[fbVersion] = @fbVersion
			  WHERE uid = @uid;
			ELSE
				IF @privateKey = N'** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **'
				  UPDATE [dbo].[openCollectors]
					SET 
					  [name] = @name
					  ,[hostname] = @hostname
					  ,[port] = @port
					  ,[authenticationMethod] = @authenticationMethod
					  ,[username] = @username
					  ,[password] = @password
					  --,[privateKey] = @privateKey
					  ,[osVersion] = @osVersion
					  ,[ocInstalled] = @ocInstalled
					  ,[ocVersion] = @ocVersion
					  ,[fbInstalled] = @fbInstalled
					  ,[fbVersion] = @fbVersion
				  WHERE uid = @uid;
				ELSE
				  UPDATE [dbo].[openCollectors]
					SET 
					  [name] = @name
					  ,[hostname] = @hostname
					  ,[port] = @port
					  ,[authenticationMethod] = @authenticationMethod
					  ,[username] = @username
					  ,[password] = @password
					  ,[privateKey] = @privateKey
					  ,[osVersion] = @osVersion
					  ,[ocInstalled] = @ocInstalled
					  ,[ocVersion] = @ocVersion
					  ,[fbInstalled] = @fbInstalled
					  ,[fbVersion] = @fbVersion
				  WHERE uid = @uid;
  ELSE
    INSERT INTO [dbo].[openCollectors]
      ([uid]
      ,[name]
      ,[hostname]
      ,[port]
      ,[authenticationMethod]
      ,[username]
      ,[password]
      ,[privateKey]
      ,[osVersion]
      ,[ocInstalled]
      ,[ocVersion]
      ,[fbInstalled]
      ,[fbVersion])
    VALUES
      (@uid
      ,@name
      ,@hostname
      ,@port
      ,@authenticationMethod
      ,@username
      ,@password
      ,@privateKey
      ,@osVersion
      ,@ocInstalled
      ,@ocVersion
      ,@fbInstalled
      ,@fbVersion);
END;
GO
