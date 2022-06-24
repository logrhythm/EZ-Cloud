-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-24
-- Description:	Insert or Update a Pipeline, based on its UID
-- =============================================
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
