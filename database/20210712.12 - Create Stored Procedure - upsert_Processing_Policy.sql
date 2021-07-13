-- Due to the impossibility to call a SP from another DB that uses a Table-Valued type
-- We need to create the real SP in EMDB, and call it from EZ using a shell SP
-- :(

USE LogRhythmEMDB
GO

DROP PROCEDURE IF EXISTS [dbo].[EZ_Upsert_Processing_Policy]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		  Tony Massé
-- Create date: 2021-07-12 -- Discovery and POC
-- Updated date: 2021-07-13 -- Bring POC into Store Procedure
-- =============================================

CREATE PROCEDURE [dbo].[EZ_Upsert_Processing_Policy] 
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

			-- Get the MPE Rule matching the LS Type UID and all its Sub Rules, and use it/them to build the Policy array
			DECLARE @MPERuleToPolicyArray dbo.MPERuleToPolicyType

			INSERT INTO @MPERuleToPolicyArray 
				SELECT
					a.MPERuleID AS 'MPERuleID', 
					@UpsertedMPEPolicyID AS 'MPEPolicyID', 
					ISNULL(a.DefMsgTTL, 32) AS 'MsgTTL', 
					ISNULL(a.DefMsgArchiveMode, 2) AS 'MsgArchiveMode', 
					ISNULL(a.DefForwarding, 0) AS 'Forwarding', 
					ISNULL(b.DefRiskRating, 0) AS 'RiskRating', 
					ISNULL(a.DefFalseAlarmRating, 0) AS 'FalseAlarmRating',
					ISNULL(a.DefLogMartMode, 13627389) AS 'LogMartMode', 
					1 AS 'Enabled'
				FROM [LogRhythmEMDB].[dbo].[MPERule] a 
				INNER JOIN [LogRhythmEMDB].[dbo].[CommonEvent] b 
					ON a.CommonEventID = b.CommonEventID 
				INNER JOIN [LogRhythmEMDB].[dbo].[MPERuleToMsgSourceType] c 
					ON a.MPERuleRegexID = c.MPERuleRegexID 
				WHERE c.MsgSourceTypeID = @RelatedLsTypeID
					AND a.RuleStatus IN (1,2)
					AND a.RecordStatus = 1
					AND a.MPERuleRegexID = @RelatedMPERuleRegexID


			-- KRA-BA-DA-BA-DOOM, create or update the MPE Policy
			DECLARE @RC int
			EXEC @RC = [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_MPEPolicy_Upsert] 
				@MPEPolicyId=@UpsertedMPEPolicyID,
				@MsgSourceTypeID=@RelatedLsTypeID,
				@Name=@UpsertedMPEPolicy_Name,
				@ShortDesc=@UpsertedMPEPolicy_ShortDesc,
				@LongDesc=@UpsertedMPEPolicy_LongDesc,
				@AllowAutoSort=@UpsertedMPEPolicy_AllowAutoSort,
				@RuleTimeoutMs=@UpsertedMPEPolicy_RuleTimeoutMs,
				@UserId=@UpsertedMPEPolicy_UpdatedBy,
				@tblPolicyRules=@MPERuleToPolicyArray

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

-- And now, for something spectacular, we create a dummy SP just to call the other...
-- :(

USE EZ
GO

DROP PROCEDURE IF EXISTS [dbo].[upsert_Processing_Policy]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		  Tony Massé
-- Create date: 2021-07-12 -- Discovery and POC
-- Updated date: 2021-07-13 -- Bring POC into Store Procedure
-- =============================================

CREATE PROCEDURE [dbo].[upsert_Processing_Policy] 
	@uid varchar(40), -- UID of the LS Type
	@name nvarchar(50), -- Name of the LS Type
	@MPEPolicy_Name varchar(50) = 'LogRhythm Default' -- Name of the new Policy (if Policy already exists, old name is kept)
AS
BEGIN
	DECLARE @RC int
	EXEC @RC = [LogRhythmEMDB].[dbo].[EZ_Upsert_Processing_Policy] 
		@uid=@uid,
		@name=@name,
		@MPEPolicy_Name=@MPEPolicy_Name
END
GO

