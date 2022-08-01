-- =============================================
-- Author:		  Tony Massé
-- Create date: 2022-07-01
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- =============================================

RAISE NOTICE '% - Create/Update View "get_SIEM_Master_ID" ownership and indices, if necessary.', clock_timestamp()::TEXT;
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

RAISE NOTICE '% - Update Function "get_SIEM_Master_ID" ownership and access rights, if necessary.', clock_timestamp()::TEXT;
GRANT SELECT ON TABLE public."get_SIEM_Master_ID" TO "oc-admin-backend";
RAISE NOTICE '% - Function "get_SIEM_Master_ID" ownership and access rights updated.', clock_timestamp()::TEXT;
