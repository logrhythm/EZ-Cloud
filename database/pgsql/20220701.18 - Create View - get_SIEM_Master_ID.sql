-- =============================================
-- Author:		  Tony Massé
-- Create date: 2022-07-01
-- =============================================

CREATE OR REPLACE VIEW public."get_SIEM_Master_ID"
AS
    SELECT
        "settingsJson"::json->'MasterID'  AS "MasterID"
    FROM
        public."settings"
    WHERE 
        "uid" = '68d79f70-f8a8-4eec-9d05-64fa3eccbf55'
        AND
        "settingsJson"::json->'MasterID' IS NOT NULL
;