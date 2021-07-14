-- Due to the impossibility to call a SP from another DB that uses a Table-Valued type
-- We need to create the real SP in EMDB, and call it from EZ using a shell SP
-- :(

USE LogRhythmEMDB
GO

DROP PROCEDURE IF EXISTS [dbo].[EZ_Upsert_Log_Source_Virtualisation_Template]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		  Tony Massé
-- Create date: 2021-07-14 -- Discovery and POC, Bring POC into Store Procedure
-- =============================================

CREATE PROCEDURE [dbo].[EZ_Upsert_Log_Source_Virtualisation_Template] 
	@Virt_Template_UID varchar(40) = '0d7544aa-5760-4c5e-be62-26262f3cd1db', -- UID of the EZ Cloud Template
	@Virt_Template_Name varchar(50) = 'EZ CLoud', -- Name of the new Template
	@ItemToInsert_ID int = NULL, -- ID of Template Item to insert, or NULL if none
	@ItemToInsert_SortOrder int = NULL, -- SortOrder of the Template Item to insert, or NULL if none or happy to get the Max +1
	@ItemToDelete_ID int = NULL -- ID of Template Item to delete, or NULL if none
AS
BEGIN
	-- Get the ID of the Virtual Source Template for EZ CLoud
	DECLARE @UpsertedVirtualSourceTemplateID int  
	SELECT TOP 1 @UpsertedVirtualSourceTemplateID = VirtualSourceTemplateID
		FROM dbo.VirtualSourceTemplate
		WHERE [Description] LIKE CONCAT('%*** EZ_UID:', @Virt_Template_UID, ':DIU_ZE ***%')

	-- Prepare the Long Description with the UID and Name
	DECLARE @LongDescWithUID varchar(255)
	SELECT @LongDescWithUID = CONCAT('_____________________________________________________
_                Automatically created by EZ Cloud Onboarder              _
___________  DO NOT MODIFY THE LINE BELOW  __________
*** EZ_UID:', @Virt_Template_UID, ':DIU_ZE ***')

	-- Prepare the "list" of Item to insert
	DECLARE @ListOfItemsToInsert dbo.DualIntTableType  
	IF @ItemToInsert_ID IS NOT NULL
	BEGIN
		IF @ItemToInsert_SortOrder IS NULL
			-- Look for the SortOrder the Item ID, if it exists
			SELECT @ItemToInsert_SortOrder = SortOrder
				FROM dbo.VirtualSourceTemplateToVirtualSourceTemplateItem
				WHERE VirtualSourceTemplateID = @UpsertedVirtualSourceTemplateID
					AND VirtualSourceTemplateItemID = @ItemToInsert_ID

		IF @ItemToInsert_SortOrder IS NULL
			-- Get the Max SortOrder +1 for the EZ Cloud Virtual Template
			SELECT @ItemToInsert_SortOrder = ISNULL(MAX(SortOrder),0) + 1
				FROM dbo.VirtualSourceTemplateToVirtualSourceTemplateItem
				WHERE VirtualSourceTemplateID = @UpsertedVirtualSourceTemplateID

		-- Add this puppy to the list
		INSERT INTO @ListOfItemsToInsert VALUES(@ItemToInsert_ID, @ItemToInsert_SortOrder)
	END

	-- Prepare the "list" of Item to delete
	DECLARE @ListOfItemsToDelete dbo.IntTableType  
	IF @ItemToDelete_ID IS NOT NULL
		-- Add this old branch to the list
		INSERT INTO @ListOfItemsToDelete VALUES(@ItemToDelete_ID)

	-- And BAM, get the job done
	DECLARE @RC int
	EXEC @RC = LogRhythm_EMDB_VirtualSourceTemplate_Upsert @Name='EZ Cloud',
		@Description=@LongDescWithUID,
		@VirtualSourceTemplateID=@UpsertedVirtualSourceTemplateID output,
		@ItemsToInsert=@ListOfItemsToInsert,
		@ItemsToDelete=@ListOfItemsToDelete,
		@IsSuperUser=0

	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT @UpsertedVirtualSourceTemplateID AS 'New_Virtual_Source_Template_ID',
		@RC AS 'EMDB_SP_Return_Code'
END
GO

-- And now, for something spectacular, we create a dummy SP just to call the other...
-- :(

USE EZ
GO

DROP PROCEDURE IF EXISTS [dbo].[upsert_Log_Source_Virtualisation_Template]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		  Tony Massé
-- Create date: 2021-07-14 -- Discovery and POC, Bring POC into Store Procedure
-- =============================================

CREATE PROCEDURE [dbo].[upsert_Log_Source_Virtualisation_Template] 
	@Virt_Template_UID varchar(40) = '0d7544aa-5760-4c5e-be62-26262f3cd1db', -- UID of the EZ Cloud Template
	@Virt_Template_Name varchar(50) = 'EZ CLoud', -- Name of the new Template
	@ItemToInsert_ID int = NULL, -- ID of Template Item to insert, or NULL if none
	@ItemToInsert_SortOrder int = NULL, -- SortOrder of the Template Item to insert, or NULL if none or happy to get the Max +1
	@ItemToDelete_ID int = NULL -- ID of Template Item to delete, or NULL if none
AS
BEGIN
	DECLARE @RC int
	EXEC @RC = [LogRhythmEMDB].[dbo].[EZ_Upsert_Log_Source_Virtualisation_Template] 
		@Virt_Template_UID=@Virt_Template_UID,
		@Virt_Template_Name=@Virt_Template_Name,
		@ItemToInsert_ID = @ItemToInsert_ID,
		@ItemToInsert_SortOrder = @ItemToInsert_SortOrder,
		@ItemToDelete_ID = @ItemToDelete_ID
END
GO

