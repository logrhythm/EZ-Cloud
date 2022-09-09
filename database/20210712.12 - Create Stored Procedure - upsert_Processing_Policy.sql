-- Old name
DROP PROCEDURE IF EXISTS [dbo].[upsert_Processing_Policy]
GO

-- New name
DROP PROCEDURE IF EXISTS [dbo].[OC_Admin_Upsert_Processing_Policy]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-07-12 -- Discovery and POC
-- Update date: 2021-07-13 -- Bring POC into Store Procedure
-- Update date: 2021-09-10 -- Refactor to not need to add a SP to EMDB
-- Update date: 2022-08-03 - To add `EZ_VERSION` flag
-- EZ_VERSION: 20210910.01 :EZ_VERSION
-- =============================================

CREATE PROCEDURE [dbo].[OC_Admin_Upsert_Processing_Policy] 
	@uid varchar(40), -- UID of the LS Type
	@name nvarchar(50), -- Name of the LS Type
	@MPEPolicy_Name varchar(50) = 'LogRhythm Default' -- Name of the new Policy (if Policy already exists, old name is kept)
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
			-- Prepare the Brief Description with the UID and Name
			DECLARE @BriefDesc varchar(255)
			SELECT @BriefDesc = CONCAT('Automatically created for:
- Stream Name:', @name, '
- Stream ID:', @uid)

			-- Prepare the Long Description with the UID and Name
			DECLARE @LongDescWithUID varchar(2000)
			SELECT @LongDescWithUID = CONCAT('
_____________________________________________________
_                                 Automatically created                                   _
___________  DO NOT MODIFY THE LINE BELOW  __________
*** EZ_UID:', @uid, N':DIU_ZE ***')

			-- Search for the first Policy for LS Type, and if found, extract all the goodies we will need later
			DECLARE @UpsertedMPEPolicyID int
			DECLARE @UpsertedMPEPolicy_Name varchar(50) = @MPEPolicy_Name
			DECLARE @UpsertedMPEPolicy_ShortDesc varchar(255) = @BriefDesc
			DECLARE @UpsertedMPEPolicy_LongDesc varchar(2000) = @LongDescWithUID
			DECLARE @UpsertedMPEPolicy_AllowAutoSort bit = 1
			DECLARE @UpsertedMPEPolicy_RuleTimeoutMs int = 100
			DECLARE @UpsertedMPEPolicy_UpdatedBy int = -100

			SELECT TOP 1 @UpsertedMPEPolicyID = [MPEPolicyID]
				  ,@UpsertedMPEPolicy_Name = [Name]
				  ,@UpsertedMPEPolicy_ShortDesc = [ShortDesc]
				  ,@UpsertedMPEPolicy_LongDesc = [LongDesc]
				  ,@UpsertedMPEPolicy_UpdatedBy = [UpdatedBy]
				  ,@UpsertedMPEPolicy_AllowAutoSort = [AllowAutoSort]
				  ,@UpsertedMPEPolicy_RuleTimeoutMs = [RuleTimeoutMs]
				FROM [LogRhythmEMDB].[dbo].[MPEPolicy]
				WHERE MsgSourceTypeID = @RelatedLsTypeID
					AND LongDesc LIKE CONCAT('%*** EZ_UID:', @uid, ':DIU_ZE ***%')
				ORDER BY [MPEPolicyID]
 
			-- In case there wasn't already a MPE Policy for this
			IF @UpsertedMPEPolicyID IS NULL
			BEGIN
				-- Get a new Policy ID
				SELECT @UpsertedMPEPolicyID = ISNULL(MAX(MPEPolicyID), 0) + 1 FROM[LogRhythmEMDB].[dbo].[MPERuleToPolicy]
			END

			-- And BAM, get the job done as [LogRhythmEMDB] as the context
			DECLARE @RC int
			EXEC @RC = LogRhythmEMDB.sys.sp_executesql N'

				-- Get the MPE Rule matching the LS Type UID and all its Sub Rules, and use it/them to build the Policy array
				DECLARE @MPERuleToPolicyArray dbo.MPERuleToPolicyType -- 👈👈👈👈👈👈👈

				INSERT INTO @MPERuleToPolicyArray 
					SELECT
						a.MPERuleID AS [MPERuleID], 
						@UpsertedMPEPolicyID AS [MPEPolicyID], 
						ISNULL(a.DefMsgTTL, 32) AS [MsgTTL], 
						ISNULL(a.DefMsgArchiveMode, 2) AS [MsgArchiveMode], 
						ISNULL(a.DefForwarding, 0) AS [Forwarding], 
						ISNULL(b.DefRiskRating, 0) AS [RiskRating], 
						ISNULL(a.DefFalseAlarmRating, 0) AS [FalseAlarmRating],
						ISNULL(a.DefLogMartMode, 13627389) AS [LogMartMode], 
						1 AS [Enabled]
					FROM [dbo].[MPERule] a 
					INNER JOIN [dbo].[CommonEvent] b 
						ON a.CommonEventID = b.CommonEventID 
					INNER JOIN [dbo].[MPERuleToMsgSourceType] c 
						ON a.MPERuleRegexID = c.MPERuleRegexID 
					WHERE c.MsgSourceTypeID = @RelatedLsTypeID
						AND a.RuleStatus IN (1,2)
						AND a.RecordStatus = 1
						AND a.MPERuleRegexID = @RelatedMPERuleRegexID


				-- KRA-BA-DA-BA-DOOM, create or update the MPE Policy
				DECLARE @RC int
				EXEC @RC = [dbo].[LogRhythm_EMDB_MPEPolicy_Upsert] 
					@MPEPolicyId=@UpsertedMPEPolicyID,
					@MsgSourceTypeID=@RelatedLsTypeID,
					@Name=@UpsertedMPEPolicy_Name,
					@ShortDesc=@UpsertedMPEPolicy_ShortDesc,
					@LongDesc=@UpsertedMPEPolicy_LongDesc,
					@AllowAutoSort=@UpsertedMPEPolicy_AllowAutoSort,
					@RuleTimeoutMs=@UpsertedMPEPolicy_RuleTimeoutMs,
					@UserId=@UpsertedMPEPolicy_UpdatedBy,
					@tblPolicyRules=@MPERuleToPolicyArray
			'
			,N'
			@UpsertedMPEPolicyID int,
			@RelatedLsTypeID int,
			@RelatedMPERuleRegexID int,
			@UpsertedMPEPolicy_Name varchar(50),
			@UpsertedMPEPolicy_ShortDesc varchar(255),
			@UpsertedMPEPolicy_LongDesc varchar(2000),
			@UpsertedMPEPolicy_AllowAutoSort bit,
			@UpsertedMPEPolicy_RuleTimeoutMs int,
			@UpsertedMPEPolicy_UpdatedBy int
			'
			,@UpsertedMPEPolicyID=@UpsertedMPEPolicyID
			,@RelatedLsTypeID=@RelatedLsTypeID
			,@RelatedMPERuleRegexID=@RelatedMPERuleRegexID
			,@UpsertedMPEPolicy_Name=@UpsertedMPEPolicy_Name
			,@UpsertedMPEPolicy_ShortDesc=@UpsertedMPEPolicy_ShortDesc
			,@UpsertedMPEPolicy_LongDesc=@UpsertedMPEPolicy_LongDesc
			,@UpsertedMPEPolicy_AllowAutoSort=@UpsertedMPEPolicy_AllowAutoSort
			,@UpsertedMPEPolicy_RuleTimeoutMs=@UpsertedMPEPolicy_RuleTimeoutMs
			,@UpsertedMPEPolicy_UpdatedBy=@UpsertedMPEPolicy_UpdatedBy

			-- SET NOCOUNT ON added to prevent extra result sets from
			-- interfering with SELECT statements.
			SET NOCOUNT ON;

			SELECT @RelatedLsTypeID AS 'LS_Type_ID',
			@RelatedMPERuleRegexID AS 'Related_Regex_ID',
			@UpsertedMPEPolicyID AS 'New_MPE_Policy_ID',
			@UpsertedMPEPolicy_Name AS 'New_MPE_Policy_Name',
			@RC AS 'EMDB_SP_Return_Code'
		END

	END
END
GO
