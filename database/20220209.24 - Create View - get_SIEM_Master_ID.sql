DROP VIEW IF EXISTS [dbo].[get_SIEM_Master_ID]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Tony Massé
-- Create date: 2022-02-09
-- Update date: 2022-08-03 - To add `EZ_VERSION` flag
-- EZ_VERSION: 20220209.01 :EZ_VERSION
-- =============================================
CREATE VIEW [dbo].[get_SIEM_Master_ID]
AS
	SELECT
		TOP 1 sc.MasterLicenseID AS 'MasterID'
	FROM [LogRhythmEMDB].[dbo].[SCLicense] sc
	WHERE sc.MasterLicenseID IS NOT NULL
GO