DROP PROCEDURE IF EXISTS [dbo].[upsert_Pipeline]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		  Tony Massé
-- Create date: 2021-05-12
-- =============================================
CREATE PROCEDURE upsert_Pipeline 
	@uid varchar(40),
	@name nvarchar(50),
	@status nvarchar(20),
	@primaryOpenCollector varchar(40),
	@fieldsMappingJson nvarchar(max),
	@collectionConfigJson nvarchar(max)
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
      )
    VALUES
      (
        @uid
        ,@name
        ,[dbo].[fn_Get_State_Id](@status)
        ,@primaryOpenCollector
        ,@fieldsMappingJson
        ,@collectionConfigJson
      );
END;
GO
