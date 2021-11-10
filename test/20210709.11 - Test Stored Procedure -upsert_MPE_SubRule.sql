USE [EZ]
GO

DECLARE @RC int
DECLARE @uid varchar(40) = '92b5c269-25db-4ea2-97c2-9112c160a309'
--DECLARE @SubRuleUid varchar(40) = '9fe1f12a-a0f4-4b3d-9795-c7eb5b5462f9'
DECLARE @SubRuleUid varchar(40) = '8fe22bcb-05da-4ab4-9271-763f6ac254f5'
DECLARE @SubRuleName nvarchar(50) = N'EZ Subrule name 8FE22'
DECLARE @TargetCommonEventID int = 1029941
DECLARE @TargetRuleStatus int = 2
DECLARE @ForwardAsEvent int = 1
DECLARE @Tag1 nvarchar(200) = '*'
DECLARE @Tag2 nvarchar(200) = '*'
DECLARE @Tag3 nvarchar(200) = '*'
DECLARE @Tag4 nvarchar(200) = '*'
DECLARE @Tag5 nvarchar(200) = '*'
DECLARE @Tag6 nvarchar(200) = '*'
DECLARE @Tag7 nvarchar(200) = '*'
DECLARE @Tag8 nvarchar(200) = '*'
DECLARE @Tag9 nvarchar(200) = '*'
DECLARE @Tag10 nvarchar(200) = '*'

-- TODO: Set parameter values here.

EXECUTE @RC = [dbo].[upsert_MPE_SubRule] 
   @uid
  ,@SubRuleUid
  ,@SubRuleName
  ,@TargetCommonEventID
  ,@TargetRuleStatus
  ,@ForwardAsEvent
select @RC as '@RC'

GO

