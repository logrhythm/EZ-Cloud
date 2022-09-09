-- Old name
DROP PROCEDURE IF EXISTS [dbo].[upsert_LogSource_Type]
GO

-- New name
DROP PROCEDURE IF EXISTS [dbo].[OC_Admin_Upsert_LogSource_Type]
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

CREATE PROCEDURE [dbo].[OC_Admin_Upsert_LogSource_Type] 
	@uid varchar(40),
	@name nvarchar(50)
AS
BEGIN
	-- Check if there is already a LS Type for this UID
	DECLARE @UpsertedLsTypeID int
	SELECT @UpsertedLsTypeID = MsgSourceTypeID
	FROM [LogRhythmEMDB].[dbo].[MsgSourceType] a
	WHERE LongDesc like CONCAT(N'%EZ_UID:', @uid, N':DIU_ZE%')

	-- If none, create a new one
	IF @UpsertedLsTypeID IS NULL
		-- Get the last ID and add one to it, to create NewID
		SELECT @UpsertedLsTypeID = ISNULL(MAX(MsgSourceTypeID), 1000000000) + 1 FROM [LogRhythmEMDB].[dbo].[MsgSourceType] WHERE MsgSourceTypeID >= 1000000000;

	-- Prepare the Long Description with the UID
	DECLARE @LongDescWithUid nvarchar(200)
	SELECT @LongDescWithUid = CONCAT(N'

_______ DO NOT MODIFY ANYTHING BELOW THIS LINE _______
',  N'*** EZ_UID:', @uid, N':DIU_ZE ***')

	-- Prepare the Abbreviation
	DECLARE @AbbreviatedName nvarchar(200)
	SELECT @AbbreviatedName = CONVERT(nvarchar(20), @name)

	-- Call LogRhythm SP to upsert the LS Type
	EXEC [LogRhythmEMDB].[dbo].[LogRhythm_EMDB_MsgSourceType_Upsert] 
		@MsgSourceTypeID=@UpsertedLsTypeID,
		@ParentMsgSourceTypeID=1000000000,
		@Name=@name,
		@FullName=@name,
		@IsMST=1,
		@ShortDesc=N'',
		@LongDesc=@LongDescWithUid ,
		@Abbreviation=@AbbreviatedName, -- First 20 chars of the Name
		@MsgSourceFormat=1, -- Always Syslog (as that's how Open Collector is pushing to log to the SMA
		@HostWizDefaults=0x0100000001010000000000000000000000
		;

	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT a.MsgSourceTypeID,
		   a.Name,
		   a.FullName,
		   ParentFullName = b.FullName,
		   a.Abbreviation,
		   a.ShortDesc,
		   a.LongDesc,
		   a.IsMST,
		   a.MsgSourceFormat,
		   a.ParentMsgSourceTypeID,
		   a.DateUpdated,
		   a.HostWizDefaults
	FROM [LogRhythmEMDB].[dbo].[MsgSourceType] a LEFT OUTER JOIN
		 [LogRhythmEMDB].[dbo].[MsgSourceType] b ON a.ParentMsgSourceTypeID = b.MsgSourceTypeID
	WHERE a.MsgSourceTypeID = @UpsertedLsTypeID;

END
GO
