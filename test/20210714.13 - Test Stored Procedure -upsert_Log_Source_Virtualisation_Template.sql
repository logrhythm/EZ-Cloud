
-- Create the Virtualisation Template for EZ Cloud
EXEC [dbo].[upsert_Log_Source_Virtualisation_Template] 
	@Virt_Template_UID = '0d7544aa-5760-4c5e-be62-26262f3cd1db', -- UID of the EZ Cloud Template
	@Virt_Template_Name = 'EZ CLoud - Test' -- Name of the new Template

-- Associate Template Item ID 2, then ID 1
EXEC [dbo].[upsert_Log_Source_Virtualisation_Template] 
	@Virt_Template_UID = '0d7544aa-5760-4c5e-be62-26262f3cd1db', -- UID of the EZ Cloud Template
	@Virt_Template_Name = 'EZ CLoud - Test', -- Name of the new Template
	@ItemToInsert_ID = 2

EXEC [dbo].[upsert_Log_Source_Virtualisation_Template] 
	@Virt_Template_UID = '0d7544aa-5760-4c5e-be62-26262f3cd1db', -- UID of the EZ Cloud Template
	@Virt_Template_Name = 'EZ CLoud - Test', -- Name of the new Template
	@ItemToInsert_ID = 1

-- Dissociate Template Item ID 2
EXEC [dbo].[upsert_Log_Source_Virtualisation_Template] 
	@Virt_Template_UID = '0d7544aa-5760-4c5e-be62-26262f3cd1db', -- UID of the EZ Cloud Template
	@Virt_Template_Name = 'EZ CLoud - Test', -- Name of the new Template
	@ItemToDelete_ID = 2

-- Associate Template Item ID 2 and dissociate Template Item ID 1
EXEC [dbo].[upsert_Log_Source_Virtualisation_Template] 
	@Virt_Template_UID = '0d7544aa-5760-4c5e-be62-26262f3cd1db', -- UID of the EZ Cloud Template
	@Virt_Template_Name = 'EZ CLoud - Test', -- Name of the new Template
	@ItemToInsert_ID = 1,
	@ItemToDelete_ID = 2
