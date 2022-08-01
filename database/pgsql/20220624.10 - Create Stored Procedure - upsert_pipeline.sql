-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-24
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- Modified on: 2022-08-03 - To add better logging
-- Description:	Insert or Update a Pipeline, based on its UID
-- =============================================

RAISE NOTICE '% - Create/Update Stored Procedure "upsert_Pipeline" ownership and indices, if necessary.', clock_timestamp()::TEXT;
DROP PROCEDURE IF EXISTS public."upsert_Pipeline";

CREATE PROCEDURE public."upsert_Pipeline"
(
    "@uid" character varying,
    "@name" character varying,
    "@status" character varying,
    "@primaryOpenCollector" character varying,
    "@fieldsMappingJson" text,
    "@collectionConfigJson" text,
    "@optionsJson" text
)
LANGUAGE plpgsql
AS $BODY$
BEGIN
    INSERT INTO public."pipelines"
    (
        "uid"
        ,"name"
        ,"status"
        ,"primaryOpenCollector"
        ,"fieldsMappingJson"
        ,"collectionConfigJson"
        ,"optionsJson"
    )
    VALUES
    (
        "@uid"
        ,"@name"
        ,public."fn_Get_State_Id"("@status")
        ,"@primaryOpenCollector"
        ,"@fieldsMappingJson"
        ,"@collectionConfigJson"
        ,"@optionsJson"
    )
    ON CONFLICT ("uid") DO
        UPDATE SET
         "name" = "@name"
        ,"status" = public."fn_Get_State_Id"("@status")
        ,"primaryOpenCollector" = "@primaryOpenCollector"
        ,"fieldsMappingJson" = "@fieldsMappingJson"
        ,"collectionConfigJson" = "@collectionConfigJson"
        ,"optionsJson" = "@optionsJson"
    ;
END;
$BODY$;

RAISE NOTICE '% - Stored Procedure "upsert_Pipeline" succesfully created/updated.', clock_timestamp()::TEXT;
RAISE NOTICE '% - Update Stored Procedure "upsert_Pipeline" ownership and access rights, if necessary.', clock_timestamp()::TEXT;

ALTER PROCEDURE public."upsert_Pipeline"
    OWNER TO "oc-admin-backend";

GRANT EXECUTE ON PROCEDURE public."upsert_Pipeline"
    TO "oc-admin-backend";

REVOKE ALL ON PROCEDURE public."upsert_Pipeline"
    FROM PUBLIC;

RAISE NOTICE '% - Stored Procedure "upsert_Pipeline" ownership and access rights updated.', clock_timestamp()::TEXT;
