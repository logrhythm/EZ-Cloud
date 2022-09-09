USE [EZ]
GO

DECLARE @RC int
DECLARE @uid varchar(40)
DECLARE @name nvarchar(50)
--DECLARE @SourceMsgSourceTypeID int
--DECLARE @TargetCommonEventID int
-- DECLARE @TargetRuleStatus int

SET @uid = '92b5c269-25db-4ea2-97c2-9112c160a309'; -- A_ EZ Test LS - MODIFIED - Biloute II
SET @name = 'A_ EZ Test LS - MODIFIED - Biloute II';



EXECUTE @RC = [dbo].[OC_Admin_Clone_MPE_Rule] 
   @uid
  ,@name
--  ,@SourceMsgSourceTypeID
--  ,@TargetCommonEventID
--  ,@TargetRuleStatus
GO


