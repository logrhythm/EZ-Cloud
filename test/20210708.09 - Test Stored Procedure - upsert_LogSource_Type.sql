USE [EZ]
GO

DECLARE @RC int
DECLARE @uid varchar(40)
DECLARE @name nvarchar(50)

SET @uid = N'92b5c269-25db-4ea2-97c2-9112c160a309';
SET @name = N'A_ EZ Test LS';

EXECUTE @RC = [dbo].[upsert_LogSource_Type] 
   @uid
  ,@name

select @RC, @uid, @name;

GO