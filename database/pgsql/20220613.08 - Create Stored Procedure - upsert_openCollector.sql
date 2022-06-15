-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-13
-- =============================================

DROP PROCEDURE IF EXISTS public."upsert_openCollector";

CREATE PROCEDURE public."upsert_openCollector"
(
    IN "@uid" character varying,
    IN "@name" character varying,
    IN "@hostname" character varying,
    IN "@port" integer, --  DEFAULT 0
    IN "@authenticationMethod" character varying,
    IN "@username" character varying,
    IN "@password" character varying,
    IN "@privateKey" character varying,
    IN "@osVersion" character varying,
    IN "@ocInstalled" integer,
    IN "@ocVersion" character varying,
    IN "@fbInstalled" integer,
    IN "@fbVersion" character varying,
    IN "@pipelines" character varying,
    IN "@installedShippers" text -- DEFAULT '[]'
)
LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
    INSERT INTO public."openCollectors" AS oc
    (
        "uid"
        ,"name"
        ,"hostname"
        ,"port"
        ,"authenticationMethod"
        ,"username"
        ,"password"
        ,"privateKey"
        ,"osVersion"
        ,"ocInstalled"
        ,"ocVersion"
        ,"fbInstalled"
        ,"fbVersion"
        ,"installedShippers"
    )
    VALUES
    (
        "@uid"
        ,"@name"
        ,"@hostname"
        ,COALESCE("@port", 0)
        ,"@authenticationMethod"
        ,"@username"
        ,"@password"
        ,"@privateKey"
        ,"@osVersion"
        ,"@ocInstalled" = 1
        ,"@ocVersion"
        ,"@fbInstalled" = 1
        ,"@fbVersion"
        ,COALESCE("@installedShippers", '[]')
    )
    ON CONFLICT ("uid") DO
        UPDATE SET
            "name" = "@name"
            ,"hostname" = "@hostname"
            ,"port" = "@port"
            ,"authenticationMethod" = "@authenticationMethod"
            ,"username" = "@username"
            ,"password" = CASE WHEN "@password" != '** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **' THEN "@password" ELSE oc."password" END
            ,"privateKey" = CASE WHEN "@privateKey" != '** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **' THEN "@privateKey" ELSE oc."privateKey" END
            ,"osVersion" = "@osVersion"
            ,"ocInstalled" = "@ocInstalled" = 1
            ,"ocVersion" = "@ocVersion"
            ,"fbInstalled" = "@fbInstalled" = 1
            ,"fbVersion" = "@fbVersion"
            ,"installedShippers" = COALESCE("@installedShippers", '[]')
    ;


    -- Sort the Pipelines out (which should be provided as a JSON array)
    -- TO BE DONE

END;
$BODY$;


ALTER PROCEDURE public."upsert_openCollector"
    OWNER TO "ez-backend";

GRANT EXECUTE ON PROCEDURE public."upsert_openCollector"
    TO "ez-backend";

REVOKE ALL ON PROCEDURE public."upsert_openCollector"
    FROM PUBLIC;
