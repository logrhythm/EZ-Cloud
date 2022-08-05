-- Old name
DROP PROCEDURE IF EXISTS [dbo].[clone_MPE_Rule]
GO

-- New name
DROP PROCEDURE IF EXISTS [dbo].[OC_Admin_Clone_MPE_Rule]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-07-08
-- Update date: 2022-08-03 - To add `EZ_VERSION` flag
-- EZ_VERSION: 20210708.01 :EZ_VERSION
-- =============================================

CREATE PROCEDURE [dbo].[OC_Admin_Clone_MPE_Rule] 
	@uid varchar(40),
	@name nvarchar(50),
	@SourceMsgSourceTypeID int = 1000772, -- for LS Type "BETA : Syslog - Open Collector - Azure Event Hub" (1000772)
	@TargetCommonEventID int = 1029941, -- Information // Generic Record
	@TargetRuleStatus int = 2 -- Test
AS
BEGIN
	-- Check LS Type for this UID
	DECLARE @RelatedLsTypeID int
	SELECT @RelatedLsTypeID = MsgSourceTypeID
	FROM [LogRhythmEMDB].[dbo].[MsgSourceType] a
	WHERE LongDesc like CONCAT(N'%EZ_UID:', @uid, N':DIU_ZE%')

	-- If none, error and do nothing
	IF @RelatedLsTypeID IS NULL
		SELECT CONCAT(N'No Log Source Type defined for UID: ', @uid, N'. Doing nothing.') as Error;
	ELSE
	BEGIN
		-- Get the parser with highest version for LS Type "BETA : Syslog - Open Collector - Azure Event Hub" (1000772), or whatever @SourceMsgSourceTypeID was provided
		DECLARE @RegexToClone varchar(6000)
		SELECT TOP 1 @RegexToClone = r.RegexTagged
			FROM [LogRhythmEMDB].[dbo].[MPERuleRegex] r, [LogRhythmEMDB].[dbo].[MPERuleToMsgSourceType] t
			WHERE r.MPERuleRegexID = t.MPERuleRegexID
				AND t.MsgSourceTypeID = @SourceMsgSourceTypeID
				AND r.RecordStatus = 1
			ORDER BY r.VersionMajor DESC,  r.VersionMinor DESC

		-- Get last and add one to it, to create Regex and MPR Rule IDs
		DECLARE @UpsertedMPERuleRegexID int
		SELECT @UpsertedMPERuleRegexID = ISNULL(MAX(MPERuleRegexID), 1000000000) + 1 FROM [LogRhythmEMDB].[dbo].[MPERuleRegex] WHERE MPERuleRegexID >= 1000000000
		DECLARE @UpsertedMPERuleID int
		SELECT @UpsertedMPERuleID = ISNULL(MAX(MPERuleID),0) + 1 FROM [LogRhythmEMDB].[dbo].[MPERule] WHERE MPERuleID >= 1000000000

		DECLARE @UpsertedMaxSortOrder int
		SELECT @UpsertedMaxSortOrder = ISNULL(MAX(SortOrder), 0) + 1 FROM [LogRhythmEMDB].[dbo].[MPERuleToMsgSourceType] WHERE MsgSourceTypeID = @RelatedLsTypeID

		-- Prepare the Brief Description with the UID and Name
		DECLARE @BriefDesc varchar(1000)
		SELECT @BriefDesc = CONCAT('Automatically created for:
- Stream ID:', @uid, '
- Stream Name:', @name
)

		DECLARE @LongDescWithUID varchar(1000)
		SELECT @LongDescWithUID = CONCAT('*** EZ_UID:', @uid, N':DIU_ZE ***')

		-- Insert Regex
		exec [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_MPERuleRegex_Upsert] @MPERuleRegexID=@UpsertedMPERuleRegexID,@RegexTagged=@RegexToClone,@IgnoreCase=1,@Multiline=0,@RecordStatus=1,@PerfMonMode=1,@VersionMajor=6,@VersionMinor=1
		-- Insert MPE Rule
		exec [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_MPERule_Upsert] @MPERuleID=@UpsertedMPERuleID,@MPERuleRegexID=@UpsertedMPERuleRegexID,@RuleStatus=@TargetRuleStatus,@CommonEventID=@TargetCommonEventID,@Name='Catch All - Level 4',@FullName='Catch All - Level 4',@BaseRule=1,@ShortDesc=@BriefDesc,@LongDesc=@LongDescWithUID,@MapTag1=NULL,@MapTag2=NULL,@MapTag3=NULL,@MapTag4=NULL,@MapTag5=NULL,@MapTag6=NULL,@MapTag7=NULL,@MapTag8=NULL,@MapTag9=NULL,@MapTag10=NULL,@MapVMID=NULL,@MapSIP=NULL,@MapDIP=NULL,@MapSName=NULL,@MapDName=NULL,@MapSPort=NULL,@MapDPort=NULL,@MapProtocolID=NULL,@MapLogin=NULL,@MapAccount=NULL,@MapGroup=NULL,@MapDomain=NULL,@MapSession=NULL,@MapProcess=NULL,@MapObject=NULL,@MapURL=NULL,@MapSender=NULL,@MapRecipient=NULL,@MapSubject=NULL,@MapBytesIn=NULL,@MapBytesOut=NULL,@MapItemsIn=NULL,@MapItemsOut=NULL,@MapDuration=NULL,@MapAmount=NULL,@MapQuantity=NULL,@MapRate=NULL,@MapSize=NULL,@DefMsgTTL=32,@DefMsgArchiveMode=2,@DefForwarding=0,@DefFalseAlarmRating=0,@DefLogMartMode=13627390,@InheritTech=1,@RecordStatus=1,@SortOrder=1,@VersionMajor=6,@VersionMinor=1,@SHostIs=1,@DHostIs=1,@ServiceIs=-1,@HostContext=0,@PrefixBaseRuleName=0,@MapUCF_A=NULL,@MapUCF_B=NULL,@MapUCF_C=NULL,@MapUCF_D=NULL,@MapUCF_E=NULL,@MapUCF_F=NULL,@MapUCF_G=NULL,@MapUCF_H=NULL,@MapUCF_I=NULL,@MapUCF_J=NULL,@MapUC50_A=NULL,@MapUC50_B=NULL,@MapUC50_C=NULL,@MapUC50_D=NULL,@MapUC50_E=NULL,@MapUC50_F=NULL,@MapUC50_G=NULL,@MapUC50_H=NULL,@MapUC50_I=NULL,@MapUC50_J=NULL,@MapUC100_A=NULL,@MapUC100_B=NULL,@MapUC100_C=NULL,@MapUC100_D=NULL,@MapUC100_E=NULL,@MapUC100_F=NULL,@MapUC100_G=NULL,@MapUC100_H=NULL,@MapUC100_I=NULL,@MapUC100_J=NULL,@MapUC255_A=NULL,@MapUC255_B=NULL,@MapUC255_C=NULL,@MapUC255_D=NULL,@MapUC255_E=NULL,@MapUC1000_A=NULL,@MapUC1000_B=NULL,@MapUC1000_C=NULL,@MapUC1000_D=NULL,@MapUC1000_E=NULL,@MapSMAC=NULL,@MapDMAC=NULL,@MapSNATIP=NULL,@MapDNATIP=NULL,@MapSInterface=NULL,@MapDInterface=NULL,@MapPID=NULL,@MapSeverity=NULL,@MapVersion=NULL,@MapCommand=NULL,@MapObjectName=NULL,@MapSNATPort=NULL,@MapDNATPort=NULL,@MPERuleIdealRegexId=NULL,@Notes=NULL,@MapAction=NULL,@MapObjectType=NULL
		-- Insert Mapping from MPE rule to LS Type
		exec [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_MPERuleToMsgSourceType_Upsert] @MsgSourceTypeID=@RelatedLsTypeID,@MPERuleRegexID=@UpsertedMPERuleRegexID,@SortOrder=@UpsertedMaxSortOrder
	END

	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SELECT @RelatedLsTypeID AS 'LS_Type_ID',
		@UpsertedMPERuleRegexID AS 'New_Regex_ID',
		@UpsertedMPERuleID AS 'New_MPE_RULE_ID'
END
GO
