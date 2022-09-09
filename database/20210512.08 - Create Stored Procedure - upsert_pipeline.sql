DROP PROCEDURE IF EXISTS [dbo].[upsert_Pipeline]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		  Tony Massé
-- Create date: 2021-05-12
-- Update date: 2021-12-06 - To add the [optionsJson] column
-- Update date: 2022-08-03 - To add `EZ_VERSION` flag
-- EZ_VERSION: 20211206.01 :EZ_VERSION
-- =============================================
CREATE PROCEDURE upsert_Pipeline 
	@uid varchar(40),
	@name nvarchar(50),
	@status nvarchar(20),
	@primaryOpenCollector varchar(40),
	@fieldsMappingJson nvarchar(max),
	@collectionConfigJson nvarchar(max),
	@optionsJson nvarchar(max)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
  IF EXISTS (SELECT *
    FROM [dbo].[pipelines]
    WHERE uid = @uid)
      UPDATE [dbo].[pipelines]
      SET 
        [name] = @name
        ,[status] = [dbo].[fn_Get_State_Id](@status)
        ,[primaryOpenCollector] = @primaryOpenCollector
        ,[fieldsMappingJson] = @fieldsMappingJson
        ,[collectionConfigJson] = @collectionConfigJson
        ,[optionsJson] = @optionsJson
      WHERE uid = @uid;
  ELSE
    INSERT INTO [dbo].[pipelines]
      (
        [uid]
        ,[name]
        ,[status]
        ,[primaryOpenCollector]
        ,[fieldsMappingJson]
        ,[collectionConfigJson]
        ,[optionsJson]
      )
    VALUES
      (
        @uid
        ,@name
        ,[dbo].[fn_Get_State_Id](@status)
        ,@primaryOpenCollector
        ,@fieldsMappingJson
        ,@collectionConfigJson
        ,@optionsJson
      );
END;
GO
