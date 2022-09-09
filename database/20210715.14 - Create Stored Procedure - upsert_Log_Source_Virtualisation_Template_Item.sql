-- Old name
DROP PROCEDURE IF EXISTS [dbo].[upsert_Log_Source_Virtualisation_Template_Item]
GO

-- New name
DROP PROCEDURE IF EXISTS [dbo].[OC_Admin_Upsert_Log_Source_Virtualisation_Template_Item]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-07-15
-- Update date: 2021-09-02 -- To align @DeviceName with what is used in the JQ Transform
-- Update date: 2022-08-03 - To add `EZ_VERSION` flag
-- EZ_VERSION: 20210902.01 :EZ_VERSION
-- =============================================

CREATE PROCEDURE [dbo].[OC_Admin_Upsert_Log_Source_Virtualisation_Template_Item] 
	@uid varchar(40), -- UID of the Log Source
	@name nvarchar(50), -- Name of Log Source
	@RegexFilter varchar(max) = NULL, -- If not provided, we build it up from UID and Name
	@MPEProcessingPolicyID int = NULL -- If not provided, we look for it
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
		-- Search for the first Policy for LS Type, and if found, extract all the goodies we will need later
		DECLARE @RelatedMPEPolicyID int

		SELECT TOP 1 @RelatedMPEPolicyID = [MPEPolicyID]
			FROM [LogRhythmEMDB].[dbo].[MPEPolicy]
			WHERE MsgSourceTypeID = @RelatedLsTypeID
				AND LongDesc LIKE CONCAT('%*** EZ_UID:', @uid, ':DIU_ZE ***%')
			ORDER BY [MPEPolicyID]
 
		-- If none, error and do nothing
		IF @RelatedMPEPolicyID IS NULL
		BEGIN
			SELECT CONCAT(N'No Log Processing Policy defined for Source Type with UID: ', @uid, N'. Doing nothing.') as Error;
		END
		ELSE
		BEGIN
			-- Build Name
			DECLARE @ItemName varchar(100);
			SELECT @ItemName = @name; -- Actually leave the Name as is

			-- Build the Device Name.
			-- Mimicking how it's done in teh EZ tool:
			/*
		        .replace(/{{EZ_compact_stream_name_placeholder}}/g, this.pipelineName.replace(/[^a-zA-Z0-9]/g, '_'))
			*/

			-- Sanitise @name and store in DeviceName
			-- Replace anything that's not a letter, a number or an underscore by an underscore
			DECLARE @DeviceName nvarchar(50);
			-- SELECT @DeviceName = REPLACE(@name, ' ', '_');       -- Remove Spaces
			-- SELECT @DeviceName = REPLACE(@DeviceName, '"', '_'); -- Remove Double quotes
			SELECT @DeviceName = @name
			DECLARE @BadCharIndex int;
			SELECT @BadCharIndex = 1
			WHILE @BadCharIndex > 0 BEGIN
				SELECT @BadCharIndex = PATINDEX('%[^a-zA-Z0-9_]%', @DeviceName)
				IF @BadCharIndex > 0
					SELECT @DeviceName = STUFF(@DeviceName, @BadCharIndex, 1, '_')
			END;
			SELECT @DeviceName = LOWER(@DeviceName);             -- And bring it down to lowercase

			-- Build Regex
			IF @RegexFilter IS NULL
			BEGIN
				SELECT @RegexFilter = CONCAT(
					'(\|device_type=', @DeviceName, '\|', -- Catch it by Device Name (the way it should be)
					'|\|beatname=', @DeviceName, '\|',    -- Or by Beatname, to work with older EZ made JQ Transforms
					'|\|stream_uid=', @uid, '\|)'         -- Or by Stream UID, nice use case
				)
			END

			-- Get Template Item ID, if exists
			DECLARE @TemplateItemID int;
			SELECT TOP 1 @TemplateItemID = VirtualSourceTemplateItemID
				FROM [LogRhythmEMDB].[dbo].[VirtualSourceTemplateItem]
				WHERE MsgSourceTypeID = @RelatedLsTypeID;

			-- Create the Item
			DECLARE @RC int
			EXEC @RC = [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_VirtualSourceTemplateItem_Upsert]
				@Name=@ItemName,
				@Regex=@RegexFilter,
				@MsgSourceTypeID=@RelatedLsTypeID,
				@MPEPolicyID=@RelatedMPEPolicyID,
				@IsSuperUser=0,
				@VirtualSourceTemplateItemID=@TemplateItemID OUTPUT

			IF @RC <> 0
			BEGIN
				SELECT CONCAT(N'Failed to add Virtual Log Source Template Item for Source Type with UID: ', @uid, N'. Stop processing.') as Error;
			END
			ELSE
			BEGIN
				-- Update Virtualisation Template to Insert new Item to it
				EXEC [dbo].[OC_Admin_Upsert_Log_Source_Virtualisation_Template]
					@ItemToInsert_ID = @TemplateItemID

				-- Spit out new Template Item ID

				-- SET NOCOUNT ON added to prevent extra result sets from
				-- interfering with SELECT statements.
				SET NOCOUNT ON;
				SELECT @RelatedLsTypeID AS 'LS_Type_ID',
					@RelatedMPEPolicyID AS 'Related_Processing_Policy_ID',
					@TemplateItemID AS 'New_Virtualisation_Template_Item_ID'
			END
		END
	END
END
GO
