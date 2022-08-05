-- Old name
DROP PROCEDURE IF EXISTS [dbo].[upsert_MPE_SubRule]
GO

-- New name
DROP PROCEDURE IF EXISTS [dbo].[OC_Admin_Upsert_MPE_SubRule]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-07-09 -- Discovery and POC
-- Update date: 2021-07-12 -- Bring POC into Store Procedure
-- Update date: 2021-07-13 -- Fix SortOrder. Default to MAX(SortOrder) + 1 for new Sub Rule, or use exisitng Sub Rule's SortOrder
-- Update date: 2022-08-03 - To add `EZ_VERSION` flag
-- EZ_VERSION: 20210713.01 :EZ_VERSION
-- =============================================

CREATE PROCEDURE [dbo].[OC_Admin_Upsert_MPE_SubRule] 
	@uid varchar(40), -- UID of the LS Type
	@SubRuleUid varchar(40),
	@SubRuleName nvarchar(50),
	@TargetCommonEventID int = 1029941, -- Information // Generic Record
	@TargetRuleStatus int = 2, -- Test
	@ForwardAsEvent int = 0, -- 0 Not an Event, 1 Is an event
	@Tag1 nvarchar(200) = '*',
	@Tag2 nvarchar(200) = '*',
	@Tag3 nvarchar(200) = '*',
	@Tag4 nvarchar(200) = '*',
	@Tag5 nvarchar(200) = '*',
	@Tag6 nvarchar(200) = '*',
	@Tag7 nvarchar(200) = '*',
	@Tag8 nvarchar(200) = '*',
	@Tag9 nvarchar(200) = '*',
	@Tag10 nvarchar(200) = '*'
AS
BEGIN
	-- Check LS Type for this UID
	DECLARE @RelatedLsTypeID int
	SELECT @RelatedLsTypeID = MsgSourceTypeID
	FROM [LogRhythmEMDB].[dbo].[MsgSourceType] a
	WHERE LongDesc LIKE CONCAT(N'%EZ_UID:', @uid, N':DIU_ZE%')

	-- If none, error and do nothing
	IF @RelatedLsTypeID IS NULL
		SELECT CONCAT(N'No Log Source Type defined for UID: "', @uid, N'". Doing nothing.') as Error;
	ELSE
	BEGIN
	-- Get RegexID for LS Type @RelatedLsTypeID, based on SortOrder and RecordStatus
	DECLARE @RelatedMPERuleRegexID int
	SELECT TOP 1 @RelatedMPERuleRegexID = r.MPERuleRegexID
			FROM [LogRhythmEMDB].[dbo].[MPERuleRegex] r, [LogRhythmEMDB].[dbo].[MPERuleToMsgSourceType] t
			WHERE r.MPERuleRegexID = t.MPERuleRegexID
				AND t.MsgSourceTypeID = @RelatedLsTypeID
				AND r.RecordStatus = 1
			ORDER BY t.SortOrder

		-- If none, error and do nothing
		IF @RelatedMPERuleRegexID IS NULL
			SELECT CONCAT(N'No MPE Rule found for Log Source Type defined for UID: "', @uid, N'". Doing nothing.') as Error;
		ELSE
		BEGIN
			DECLARE @UpsertedMPERuleID int
			-- Get the Sub Rule matching the @SubRuleUid for this LS Type
			SELECT @UpsertedMPERuleID = m.MPERuleID -- r.MPERuleRegexID, m.BaseRule, m.SortOrder, m.*
					FROM [LogRhythmEMDB].[dbo].[MPERuleRegex] r, [LogRhythmEMDB].[dbo].[MPERuleToMsgSourceType] t, [LogRhythmEMDB].[dbo].[MPERule] m
					WHERE
						 r.MPERuleRegexID = t.MPERuleRegexID
						AND t.MsgSourceTypeID = @RelatedLsTypeID
						AND m.MPERuleRegexID = r.MPERuleRegexID
						AND r.RecordStatus = 1
						AND m.BaseRule = 0
						AND m.LongDesc LIKE CONCAT('%*** UID:', @SubRuleUid, ':DIU ***%')
					ORDER BY t.SortOrder

			DECLARE @UpsertedMaxSortOrder int = 1000000000 -- Default SortOrder assigned by Console when no particular SortOrder is provided
			-- If none, get a fresh ID for the new Sub Rule
			IF @UpsertedMPERuleID IS NULL
			BEGIN
				-- Get last and add one to it, to create MPE Rule IDs
				SELECT @UpsertedMPERuleID = ISNULL(MAX(MPERuleID),0) + 1 FROM [LogRhythmEMDB].[dbo].[MPERule] WHERE MPERuleID >= 1000000000
				-- Get a new SortOrder
				SELECT @UpsertedMaxSortOrder = ISNULL(MAX(SortOrder), 0) + 1 FROM [LogRhythmEMDB].[dbo].[MPERule] WHERE SortOrder < 1000000000
					AND MPERuleRegexID = @RelatedMPERuleRegexID
					AND BaseRule = 0
			END
			ELSE
			BEGIN
				-- Get a current SortOrder
				SELECT @UpsertedMaxSortOrder = ISNULL(SortOrder, 1) FROM [LogRhythmEMDB].[dbo].[MPERule] WHERE MPERuleID = @UpsertedMPERuleID
			END

			-- Prep the Long Description with UID
			DECLARE @LongDescWithUID varchar(1000)
			SELECT @LongDescWithUID = CONCAT('
______________________________________________
_                          Automatically created                            _
_______  DO NOT MODIFY THE LINE BELOW  _______
*** UID:', @SubRuleUid, ':DIU ***')

			-- BOOM, create or update the Sub Rule 
			DECLARE @RC int
			EXEC @RC = [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_MPERule_Upsert] 
			@MPERuleID=@UpsertedMPERuleID,@MPERuleRegexID=@RelatedMPERuleRegexID,@RuleStatus=@TargetRuleStatus,
			@CommonEventID=@TargetCommonEventID,@Name=@SubRuleName,@FullName=@SubRuleName,@BaseRule=0,@ShortDesc='',@LongDesc=@LongDescWithUID,
			@MapTag1=@Tag1,@MapTag2=@Tag2,@MapTag3=@Tag3,@MapTag4=@Tag4,@MapTag5=@Tag5,@MapTag6=@Tag6,@MapTag7=@Tag7,@MapTag8=@Tag8,@MapTag9=@Tag9,@MapTag10=@Tag10,
			@MapVMID='*',@MapSIP='*',@MapDIP='*',@MapSName='*',@MapDName='*',@MapSPort='*',@MapDPort='*',@MapProtocolID='*',@MapLogin='*',@MapAccount='*',@MapGroup='*',@MapDomain=NULL,@MapSession='*',@MapProcess='*',@MapObject='*',@MapURL='*',@MapSender='*',@MapRecipient='*',@MapSubject='*',@MapBytesIn='*',@MapBytesOut='*',@MapItemsIn='*',@MapItemsOut='*',@MapDuration='*',@MapAmount='*',@MapQuantity='*',@MapRate='*',@MapSize='*',
			@DefMsgTTL=32,@DefMsgArchiveMode=2,@DefForwarding=@ForwardAsEvent,@DefFalseAlarmRating=0,@DefLogMartMode=13627389,@InheritTech=1,@RecordStatus=1,
			@SortOrder=@UpsertedMaxSortOrder,@VersionMajor=6,@VersionMinor=1,@SHostIs=1,@DHostIs=1,@ServiceIs=-1,@HostContext=0,@PrefixBaseRuleName=0,
			@MapUCF_A=NULL,@MapUCF_B=NULL,@MapUCF_C=NULL,@MapUCF_D=NULL,@MapUCF_E=NULL,@MapUCF_F=NULL,@MapUCF_G=NULL,@MapUCF_H=NULL,@MapUCF_I=NULL,@MapUCF_J=NULL,@MapUC50_A=NULL,@MapUC50_B=NULL,@MapUC50_C=NULL,@MapUC50_D=NULL,@MapUC50_E=NULL,@MapUC50_F=NULL,@MapUC50_G=NULL,@MapUC50_H=NULL,@MapUC50_I=NULL,@MapUC50_J=NULL,@MapUC100_A=NULL,@MapUC100_B=NULL,@MapUC100_C=NULL,@MapUC100_D=NULL,@MapUC100_E=NULL,@MapUC100_F=NULL,@MapUC100_G=NULL,@MapUC100_H=NULL,@MapUC100_I=NULL,@MapUC100_J=NULL,@MapUC255_A=NULL,@MapUC255_B=NULL,@MapUC255_C=NULL,@MapUC255_D=NULL,@MapUC255_E=NULL,@MapUC1000_A=NULL,@MapUC1000_B=NULL,@MapUC1000_C=NULL,@MapUC1000_D=NULL,@MapUC1000_E=NULL,
			@MapSMAC='*',@MapDMAC='*',@MapSNATIP='*',@MapDNATIP='*',@MapSInterface='*',@MapDInterface='*',@MapPID='*',@MapSeverity='*',@MapVersion='*',@MapCommand='*',@MapObjectName='*',@MapSNATPort='*',@MapDNATPort='*',@MPERuleIdealRegexId=NULL,@Notes=NULL,@MapAction='*',@MapObjectType='*'

			-- SET NOCOUNT ON added to prevent extra result sets from
			-- interfering with SELECT statements.
			SET NOCOUNT ON;
			SELECT @RelatedLsTypeID AS 'LS_Type_ID',
				@RelatedMPERuleRegexID AS 'MPE_Regex_ID',
				@UpsertedMaxSortOrder AS 'MPE_SortOrder',
				@UpsertedMPERuleID AS 'Upserted_MPE_SubRule_ID',
				@RC as 'EMDB_SP_Return_Code'

		END

	END
END
GO
