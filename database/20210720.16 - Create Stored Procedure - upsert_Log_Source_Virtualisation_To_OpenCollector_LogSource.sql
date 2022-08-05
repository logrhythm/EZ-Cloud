-- Old name
DROP PROCEDURE IF EXISTS [dbo].[upsert_Log_Source_Virtualisation_To_OpenCollector_LogSource]
GO

-- New name
DROP PROCEDURE IF EXISTS [dbo].[OC_Admin_Upsert_Log_Source_Virtualisation_To_OpenCollector_LogSource]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-07-20
-- Update date: 2021-07-21 - Remove unnecessary parameter (@OpenCollectorLogSourceTypeID)
-- Update date: 2021-07-21 - Change separator between OC Log Source and Virtual LS (adding spaces around the dash: '-' -> ' - ')
-- Update date: 2021-11-08 - Change type for @VirtualSourceTemplateItemRegex to handle RegEx properly ('nvarchar(100)' -> 'varchar(max)')
-- Update date: 2022-02-15 - Collect Log Source Identifiers for the OC Log Source, to then re-apply them after they get deleted
-- Update date: 2022-08-03 - To add `EZ_VERSION` flag
-- EZ_VERSION: 20220215.01 :EZ_VERSION
-- =============================================

CREATE PROCEDURE [dbo].[OC_Admin_Upsert_Log_Source_Virtualisation_To_OpenCollector_LogSource] 
	@uid varchar(40), -- UID of the Log Source
	@OpenCollectorMotherLogSourceID int, -- Log Source ID of the Open Collector
	@Virt_Template_UID varchar(40) = '0d7544aa-5760-4c5e-be62-26262f3cd1db' -- UID of the EZ Cloud Template
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
		-- Get VirtualSourceTemplateID

		DECLARE @VirtualSourceTemplateID int
		DECLARE @VirtualSourceTemplateName varchar(50)

		SELECT TOP 1
			@VirtualSourceTemplateID = VirtualSourceTemplateID,
			@VirtualSourceTemplateName = [Name]
			FROM [LogRhythmEMDB].[dbo].[VirtualSourceTemplate]
			WHERE [Description] LIKE CONCAT('%*** EZ_UID:', @Virt_Template_UID, ':DIU_ZE ***%')

		-- Get Virtual Log Source Template Item details

		DECLARE @VirtualSourceTemplateItemID int
		DECLARE @VirtualSourceTemplateItemName nvarchar(100)
		DECLARE @VirtualSourceTemplateItemRegex varchar(max)
		DECLARE @VirtualSourceTemplateItemMPEPolicyID int

		SELECT TOP 1
			@VirtualSourceTemplateItemID = VirtualSourceTemplateItemID,
			@VirtualSourceTemplateItemName = [Name],
			@VirtualSourceTemplateItemRegex = Regex,
			@VirtualSourceTemplateItemMPEPolicyID = MPEPolicyID
						FROM [LogRhythmEMDB].[dbo].[VirtualSourceTemplateItem]
						WHERE MsgSourceTypeID = @RelatedLsTypeID;

		-- Create a table variable to receive data from [LogRhythm_EMDB_GetMessageSources_SelectAll]
		DECLARE @temp_LS_Details TABLE (
			MsgSourceID int,
			EntityID_4 int,
			SystemMonitorID int,
			[Status] tinyint,
			Name_7 varchar(100),
			HostID int,
			HostName varchar(100),
			MsgSourceTypeID int,
			[Name] varchar(100),
			ShortDesc varchar(255),
			LongDesc varchar(2000),
			MPEMode tinyint,
			DefMsgTTL smallint,
			DefMsgArchiveMode tinyint,
			MPEPolicyID int,
			IsVirtual tinyint,
			RecordStatus tinyint,
			HostID_20 int,
			DateUpdated_21 datetime,
			LogMartMode bigint,
			MaxLogDate datetime,
			UDLAConnectionString varchar(1000),
			UDLAStateField varchar(100),
			UDLAStateFieldType tinyint,
			UDLAStateFieldConversion varchar(1000),
			UDLAQueryStatement varchar(max),
			UDLAOutputFormat varchar(max),
			UDLAUniqueIdentifier varchar(1000),
			UDLAMsgDateField varchar(100),
			UDLAGetUTCDateStatement varchar(500),
			PersistentConnection bit,
			FilePath varchar(255),
			MsgSourceDateFormatID int,
			MsgsPerCycle int,
			MonitorStart datetime,
			MonitorStop datetime,
			CollectionDepth int,
			MsgRegexStart varchar(1000),
			MsgRegexDelimeter varchar(1000),
			MsgRegexEnd varchar(1000),
			RecursionDepth int,
			IsDirectory tinyint,
			Inclusions varchar(256),
			Exclusions varchar(256),
			Parameter1 int,
			Parameter2 int,
			Parameter3 int,
			StatePosition varbinary(max),
			StateLastUpdated bigint,
			CompressionType tinyint,
			UDLAConnectionType tinyint,
			Parameter4 int,
			Name_55 varchar(100),
			Name_56 varchar(100),
			CollectionThreadTimeout int,
			VirtualSourceRegex varchar(max),
			VirtualSourceSortOrder int,
			VirtualSourceCatchAllID int,
			VirtualSourceParentID int,
			VirtualSourceParentName_62 varchar(max),
			IsLoadBalanced tinyint,
			AutoAcceptanceRuleID_64 int,
			LookupGUID bit,
			LookupSID bit,
			ReadPublisherMetadata bit,
			DaysToWatchModifiedFiles int
		)

		INSERT INTO @temp_LS_Details
		EXEC [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_GetMessageSources_SelectAll] @UseRestrictedAdmin=1

		-- Declare about half a million variables...

		DECLARE @MsgSourceID              int
		DECLARE @SystemMonitorID          int
		DECLARE @HostID                   int
		DECLARE @HostName                 varchar(100)
		DECLARE @MsgSourceTypeID          int
		DECLARE @Name                     varchar(100)
		DECLARE @ShortDesc                varchar(255)
		DECLARE @LongDesc                 varchar(2000)
		DECLARE @MsgSourceDateFormatID    int
		DECLARE @CollectionDepth          int
		DECLARE @MsgsPerCycle             int
		DECLARE @FilePath                 varchar(255)
		DECLARE @MonitorStart             datetime
		DECLARE @MonitorStop              datetime
		DECLARE @DefMsgTTL                smallint
		DECLARE @DefMsgArchiveMode        tinyint
		DECLARE @MPEMode                  tinyint
		DECLARE @MPEPolicyID              int
		DECLARE @IsVirtual                tinyint
		DECLARE @RecordStatus             tinyint
		DECLARE @LogMartMode              bigint
		DECLARE @UDLAConnectionString     varchar(1000)
		DECLARE @UDLAStateField           varchar(100)
		DECLARE @UDLAStateFieldType       tinyint
		DECLARE @UDLAStateFieldConversion varchar(1000)
		DECLARE @UDLAQueryStatement       varchar(max)
		DECLARE @UDLAOutputFormat         varchar(max)
		DECLARE @UDLAUniqueIdentifier     varchar(1000)
		DECLARE @UDLAMsgDateField         varchar(100)
		DECLARE @UDLAGetUTCDateStatement  varchar(500)
		DECLARE @PersistentConnection     bit
		DECLARE @Status                   tinyint
		DECLARE @MaxLogDate               datetime
		DECLARE @MsgRegexStart            varchar(1000)
		DECLARE @MsgRegexDelimeter        varchar(1000)
		DECLARE @MsgRegexEnd              varchar(1000)
		DECLARE @RecursionDepth           int
		DECLARE @IsDirectory              tinyint
		DECLARE @Inclusions               varchar(256)
		DECLARE @Exclusions               varchar(256)
		DECLARE @Parameter1               int
		DECLARE @Parameter2               int
		DECLARE @Parameter3               int
		DECLARE @StatePosition            varbinary(max)
		DECLARE @StateLastUpdated         bigint
		DECLARE @CompressionType          tinyint
		DECLARE @UDLAConnectionType       tinyint
		DECLARE @Parameter4               int
		DECLARE @CollectionThreadTimeout  int
		DECLARE @VirtualSourceRegex       varchar(max) = ''
		DECLARE @VirtualSourceSortOrder   int = 1
		DECLARE @VirtualSourceCatchAllID  int = NULL
		DECLARE @VirtualSourceParentID    int = NULL
		DECLARE @IsLoadBalanced           tinyint
		DECLARE @UserID                   int = NULL
		DECLARE @UseRestrictedAdmin       bit = 1
		DECLARE @LookupGUID		          bit = 1
		DECLARE @LookupSID				  bit = 1
		DECLARE @ReadPublisherMetadata    bit = 1
		DECLARE @DaysToWatchModifiedFiles int = 1

		-- And affect them with the result from @temp_LS_Details that match the mother LS ID (@OpenCollectorMotherLogSourceID)

		SELECT TOP 1
			@MsgSourceID = MsgSourceID,
			@SystemMonitorID = SystemMonitorID,
			@HostID = HostID,
			@HostName = HostName,
			@MsgSourceTypeID = MsgSourceTypeID,
			@Name = [Name],
			@ShortDesc = ShortDesc,
			@LongDesc = LongDesc,
			@MsgSourceDateFormatID = MsgSourceDateFormatID,
			@CollectionDepth = CollectionDepth,
			@MsgsPerCycle = MsgsPerCycle,
			@FilePath = FilePath,
			@MonitorStart = MonitorStart,
			@MonitorStop = MonitorStop,
			@DefMsgTTL = DefMsgTTL,
			@DefMsgArchiveMode = DefMsgArchiveMode,
			@MPEMode = MPEMode,
			@MPEPolicyID = MPEPolicyID,
			@IsVirtual = IsVirtual,
			@RecordStatus = RecordStatus,
			@LogMartMode = LogMartMode,
			@UDLAConnectionString = UDLAConnectionString,
			@UDLAStateField = UDLAStateField,
			@UDLAStateFieldType = UDLAStateFieldType,
			@UDLAStateFieldConversion = UDLAStateFieldConversion,
			@UDLAQueryStatement = UDLAQueryStatement,
			@UDLAOutputFormat = UDLAOutputFormat,
			@UDLAUniqueIdentifier = UDLAUniqueIdentifier,
			@UDLAMsgDateField = UDLAMsgDateField,
			@UDLAGetUTCDateStatement = UDLAGetUTCDateStatement,
			@PersistentConnection = PersistentConnection,
			@Status = [Status],
			@MaxLogDate = MaxLogDate,
			@MsgRegexStart = MsgRegexStart,
			@MsgRegexDelimeter = MsgRegexDelimeter,
			@MsgRegexEnd = MsgRegexEnd,
			@RecursionDepth = RecursionDepth,
			@IsDirectory = IsDirectory,
			@Inclusions = Inclusions,
			@Exclusions = Exclusions,
			@Parameter1 = Parameter1,
			@Parameter2 = Parameter2,
			@Parameter3 = Parameter3,
			@StatePosition = StatePosition,
			@StateLastUpdated = StateLastUpdated,
			@CompressionType = CompressionType,
			@UDLAConnectionType = UDLAConnectionType,
			@Parameter4 = Parameter4,
			@CollectionThreadTimeout = CollectionThreadTimeout,
			@VirtualSourceRegex = VirtualSourceRegex,
			@VirtualSourceSortOrder = VirtualSourceSortOrder,
			@VirtualSourceCatchAllID = VirtualSourceCatchAllID,
			@VirtualSourceParentID = VirtualSourceParentID,
			@IsLoadBalanced = IsLoadBalanced,
			@UserID = NULL,
			@UseRestrictedAdmin = 1,
			@LookupGUID = LookupGUID,
			@LookupSID = LookupSID,
			@ReadPublisherMetadata = ReadPublisherMetadata,
			@DaysToWatchModifiedFiles = DaysToWatchModifiedFiles
		FROM @temp_LS_Details
		WHERE MsgSourceID=@OpenCollectorMotherLogSourceID

		-- Create the new name
		-- Host Name + LS Type's Short Name + Virt LS Name

		DECLARE @UpsertedVirtualLogSourceName nvarchar(100) = '';
		SET @UpsertedVirtualLogSourceName = @UpsertedVirtualLogSourceName + @Name
		SET @UpsertedVirtualLogSourceName = @UpsertedVirtualLogSourceName + ' - ' 
		SET @UpsertedVirtualLogSourceName = @UpsertedVirtualLogSourceName + @VirtualSourceTemplateItemName

		-- Check the LS doens't already exist:

		DECLARE @temp_MsgSourceID TABLE (
			MsgSourceID int
			)

		INSERT INTO @temp_MsgSourceID
			EXEC [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_GetMessageSouceId_BySystemMoniotorIDAndName]
				@SystemMonitorID=@SystemMonitorID,
				@Name=@UpsertedVirtualLogSourceName

		IF EXISTS (SELECT * FROM @temp_MsgSourceID)
			-- It already exists, exiting with error
			SELECT CONCAT(N'Virtualised Log Source named "', @UpsertedVirtualLogSourceName, N'" already defined for UID: "', @uid, N'". Doing nothing.') as Error;
		ELSE
		BEGIN
			-- Prepare the temporary table to store the list of Identifiers for the parent LS (OC)
			DECLARE @temp_HostIdentifiers TABLE (
				HostIdentifierID int,
				[Type] tinyint,
				[Value] varchar(255),
				MsgSourceID int
				)

			-- Gather the Identifiers for the parent LS
			INSERT INTO @temp_HostIdentifiers
				EXEC [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_GetHostIdentifier_ByMsgSourceID]
					@MsgSourceID=@OpenCollectorMotherLogSourceID,
					@UseRestrictedAdmin=1

			-- Get the @UpsertedVirtualSourceSortOrder
			DECLARE @UpsertedVirtualSourceSortOrder int
			SELECT TOP 1
				@UpsertedVirtualSourceSortOrder = ISNULL(MAX(VirtualSourceSortOrder), 0) + 1
			FROM @temp_LS_Details
			WHERE VirtualSourceParentID=@OpenCollectorMotherLogSourceID
			-- SELECT @UpsertedVirtualSourceSortOrder AS '@UpsertedVirtualSourceSortOrder'

			-- Prepare the Short Description with the UID and Name
			DECLARE @ShortDescWithUID nvarchar(255)
			SELECT @ShortDescWithUID = CONCAT('Automatically created by EZ Cloud Onboarder for:
 - Stream Name:', @VirtualSourceTemplateItemName, '
 - Stream UID:', @uid)

			-- Prepare the Long Description with the UID and Name
			DECLARE @LongDescWithUID varchar(255)
			SELECT @LongDescWithUID = CONCAT('

_____________________________________________________
_                Automatically created by EZ Cloud Onboarder              _
___________  DO NOT MODIFY THE LINE BELOW  __________
*** EZ_UID:', @uid, ':DIU_ZE ***')

			-- Create the new Virtualised LS

			DECLARE @UpsertedMsgSourceID int
			SET @UpsertedMsgSourceID=NULL
			EXEC [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_MsgSource_Insert]
				@MsgSourceID=@UpsertedMsgSourceID OUTPUT,
				@SystemMonitorID=@SystemMonitorID,
				@HostID=@HostID,
				@MsgSourceTypeID=@RelatedLsTypeID,
				@MPEPolicyID=@VirtualSourceTemplateItemMPEPolicyID,
				@Name=@UpsertedVirtualLogSourceName,
				@ShortDesc=@ShortDescWithUID,
				@LongDesc=@LongDescWithUID,
				@FilePath = @FilePath,
				@MsgSourceDateFormatID = @MsgSourceDateFormatID,
				@CollectionDepth = @CollectionDepth,
				@MonitorStart = @MonitorStart,
				@MonitorStop = @MonitorStop,
				@DefMsgTTL = @DefMsgTTL,
				@DefMsgArchiveMode = @DefMsgArchiveMode,
				@MPEMode = @MPEMode,
				@LogMartMode = @LogMartMode,
				@MsgsPerCycle = @MsgsPerCycle,
				@IsVirtual = @IsVirtual,
				@RecordStatus = @RecordStatus,
				@UDLAConnectionString = @UDLAConnectionString,
				@UDLAStateField = @UDLAStateField,
				@UDLAStateFieldType = @UDLAStateFieldType,
				@UDLAStateFieldConversion = @UDLAStateFieldConversion,
				@UDLAQueryStatement = @UDLAQueryStatement,
				@UDLAOutputFormat = @UDLAOutputFormat,
				@UDLAUniqueIdentifier = @UDLAUniqueIdentifier,
				@UDLAMsgDateField = @UDLAMsgDateField,
				@UDLAGetUTCDateStatement = @UDLAGetUTCDateStatement,
				@PersistentConnection = @PersistentConnection,
				@Status = @Status,
				@MaxLogDate = @MaxLogDate,
				@MsgRegexStart = @MsgRegexStart,
				@MsgRegexDelimeter = @MsgRegexDelimeter,
				@MsgRegexEnd = @MsgRegexEnd,
				@RecursionDepth = @RecursionDepth,
				@IsDirectory = @IsDirectory,
				@Inclusions = @Inclusions,
				@Exclusions = @Exclusions,
				@Parameter1 = @Parameter1,
				@Parameter2 = @Parameter2,
				@Parameter3 = @Parameter3,
				@StatePosition = @StatePosition,
				@StateLastUpdated = @StateLastUpdated,
				@CompressionType = @CompressionType,
				@UDLAConnectionType = @UDLAConnectionType,
				@Parameter4 = @Parameter4,
				@CollectionThreadTimeout = @CollectionThreadTimeout,
				@VirtualSourceRegex = @VirtualSourceTemplateItemRegex,
				@VirtualSourceSortOrder = @UpsertedVirtualSourceSortOrder,
				@VirtualSourceCatchAllID = @MsgSourceID,
				@VirtualSourceParentID = @MsgSourceID,
				@IsLoadBalanced = @IsLoadBalanced,
				@LookupGUID = @LookupGUID,
				@LookupSID = @LookupSID,
				@ReadPublisherMetadata = @ReadPublisherMetadata,
				@DaysToWatchModifiedFiles = @DaysToWatchModifiedFiles,
				@UseRestrictedAdmin = @UseRestrictedAdmin

			-- Update the Mother LS (to set @VirtualSourceCatchAllID)

			DECLARE @PleaseStayQuiet TABLE
				(
					DummyMsgSourceID int 
				)
			INSERT INTO @PleaseStayQuiet -- Yep, someone decided that this SP should print out the @MsgSourceID instead of using OUTPUT, so we are silencing it to keep up a clean output
			EXEC [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_MsgSource_UPDATE]
				@MsgSourceID=@MsgSourceID,
				@SystemMonitorID = @SystemMonitorID,
				@HostID = @HostID,
				@MsgSourceTypeID = @MsgSourceTypeID,
				@MPEPolicyID = @MPEPolicyID,
				@Name = @Name,
				@ShortDesc = @ShortDesc,
				@LongDesc = @LongDesc,
				@FilePath = @FilePath,
				@MsgSourceDateFormatID = @MsgSourceDateFormatID,
				@CollectionDepth = @CollectionDepth,
				@MonitorStart = @MonitorStart,
				@MonitorStop = @MonitorStop,
				@DefMsgTTL = @DefMsgTTL,
				@DefMsgArchiveMode = @DefMsgArchiveMode,
				@MPEMode = @MPEMode,
				@LogMartMode = @LogMartMode,
				@MsgsPerCycle = @MsgsPerCycle,
				@IsVirtual = @IsVirtual,
				@RecordStatus = @RecordStatus,
				@UDLAConnectionString = @UDLAConnectionString,
				@UDLAStateField = @UDLAStateField,
				@UDLAStateFieldType = @UDLAStateFieldType,
				@UDLAStateFieldConversion = @UDLAStateFieldConversion,
				@UDLAQueryStatement = @UDLAQueryStatement,
				@UDLAOutputFormat = @UDLAOutputFormat,
				@UDLAUniqueIdentifier = @UDLAUniqueIdentifier,
				@UDLAMsgDateField = @UDLAMsgDateField,
				@UDLAGetUTCDateStatement = @UDLAGetUTCDateStatement,
				@PersistentConnection = @PersistentConnection,
				@Status = @Status,
				@MaxLogDate = @MaxLogDate,
				@MsgRegexStart = @MsgRegexStart,
				@MsgRegexDelimeter = @MsgRegexDelimeter,
				@MsgRegexEnd = @MsgRegexEnd,
				@RecursionDepth = @RecursionDepth,
				@IsDirectory = @IsDirectory,
				@Inclusions = @Inclusions,
				@Exclusions = @Exclusions,
				@Parameter1 = @Parameter1,
				@Parameter2 = @Parameter2,
				@Parameter3 = @Parameter3,
				@StatePosition = @StatePosition,
				@StateLastUpdated = @StateLastUpdated,
				@CompressionType = @CompressionType,
				@UDLAConnectionType = @UDLAConnectionType,
				@Parameter4 = @Parameter4,
				@CollectionThreadTimeout = @CollectionThreadTimeout,
				@VirtualSourceRegex = @VirtualSourceRegex,
				@VirtualSourceSortOrder = @VirtualSourceSortOrder,
				@VirtualSourceCatchAllID = @MsgSourceID,
				@VirtualSourceParentID = @VirtualSourceParentID,
				@IsLoadBalanced = @IsLoadBalanced,
				@LookupGUID = @LookupGUID,
				@LookupSID = @LookupSID,
				@ReadPublisherMetadata = @ReadPublisherMetadata,
				@DaysToWatchModifiedFiles = @DaysToWatchModifiedFiles,
				@UseRestrictedAdmin = @UseRestrictedAdmin

			-- Delete HostIdentifierToMsgSource records for a MsgSourceID (looks safe to re-run)

			EXEC [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_HostIdentifierToMsgSource_DeleteByMsgSourceID] @MsgSourceID=@MsgSourceID

			-- If we found any, do re-apply Identifiers to the parent LS (OC)
			IF EXISTS (SELECT * FROM @temp_HostIdentifiers)
			BEGIN
				DECLARE @HostIdentifierID int
				DECLARE @Type tinyint
				DECLARE @Value varchar(255)
				DECLARE @TmpMsgSourceID int

				-- Clean up (should not exist in real life, but when testing this can be annoying)
				DROP TABLE IF EXISTS #keyed_temp_HostIdentifiers;

				-- Fill in the Host Identifiers into a Keyed temporary table
				SELECT NULL active_key, * INTO #keyed_temp_HostIdentifiers FROM @temp_HostIdentifiers

				-- Flag the first record as active
				UPDATE TOP (1) #keyed_temp_HostIdentifiers set active_key = 1
				
				WHILE @@rowcount > 0
					BEGIN
						-- Grab first active record (there should be only one)
						SELECT TOP 1
							@HostIdentifierID = HostIdentifierID,
							@Type = [Type],
							@Value = [Value],
							@TmpMsgSourceID = MsgSourceID
						FROM #keyed_temp_HostIdentifiers WHERE active_key = 1

						-- Add the identifier, only if @HostIdentifierID is not null, as it otherwhise cause an error
						IF @HostIdentifierID IS NOT NULL
							exec LogRhythm_EMDB_HostIdentifierToMsgSource_Insert @HostIdentifierID=@HostIdentifierID,@MsgSourceID=@TmpMsgSourceID,@MsgSourceFormat=1

						-- Remove the processed item
						DELETE TOP (1) #keyed_temp_HostIdentifiers where active_key = 1
						-- Flag the next (now first) record as active
						UPDATE TOP (1) #keyed_temp_HostIdentifiers set active_key = 1
						-- And keep on looping! Baby!
					END -- WHILE @@rowcount > 0
			END -- IF EXISTS (SELECT * FROM @temp_HostIdentifiers)

			-- Push to Agent

			DECLARE @NewCommentID int
			SET @NewCommentID=NULL
			EXEC [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_SystemMonitorComponentServiceRequest_Insert] @SystemMonitorID=@SystemMonitorID,@ComponentType=3,@RequestType=0,@Status=0,@Message=N'The service request is waiting to be delivered to the Agent.',@DataLength=0,@UserID=-100,@ComponentID=@NewCommentID output

			-- Output results

			-- SET NOCOUNT ON added to prevent extra result sets from
			-- interfering with SELECT statements.
			SET NOCOUNT ON;

			SELECT p.DummyMsgSourceID AS 'UpdatedOpenCollectorLogSourceID', @UpsertedMsgSourceID AS 'UpsertedVirtualLogSourceID', @NewCommentID AS 'NewCommentID' FROM @PleaseStayQuiet p
		END
	END
END
GO
