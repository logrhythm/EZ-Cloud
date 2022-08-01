DROP VIEW IF EXISTS [dbo].[get_EZ_Versions]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Tony Massé
-- Create date: 2022-08-03
-- EZ_VERSION: 20220803.01 :EZ_VERSION
-- =============================================
CREATE VIEW [dbo].[get_EZ_Versions]
AS
    SELECT
        sao.name AS [Name],
        ISNULL(
            CONVERT(
                FLOAT,
                SUBSTRING(
                    ISNULL(smsao.definition, ssmsao.definition),
                    s.s,
                    ISNULL(NULLIF(e.e, 0), s.s) - s.s
                )
            ),
            0
        ) AS [Version]
    FROM
        sys.all_objects AS sao
        LEFT OUTER JOIN sys.sql_modules AS smsao ON smsao.object_id = sao.object_id
        LEFT OUTER JOIN sys.system_sql_modules AS ssmsao ON ssmsao.object_id = sao.object_id
        CROSS APPLY (
            SELECT CHARINDEX('EZ_VERSION:', ISNULL(smsao.definition, ssmsao.definition)) + 11 AS s
        ) s
        CROSS APPLY (
            SELECT CHARINDEX(':EZ_VERSION', ISNULL(smsao.definition, ssmsao.definition), s) AS e
        ) e
    WHERE
        s.s > 11
    ORDER BY [Name]
GO