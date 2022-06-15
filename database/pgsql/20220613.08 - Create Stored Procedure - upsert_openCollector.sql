-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-13
-- =============================================

DROP PROCEDURE IF EXISTS public."upsert_openCollector";

CREATE PROCEDURE public."upsert_openCollector"
(
    IN "_uid" character varying,
    IN "_name" character varying,
    IN "_hostname" character varying,
    IN "_port" integer, --  DEFAULT 0
    IN "_authenticationMethod" character varying,
    IN "_username" character varying,
    IN "_password" character varying,
    IN "_privateKey" character varying,
    IN "_osVersion" character varying,
    IN "_ocInstalled" integer,
    IN "_ocVersion" character varying,
    IN "_fbInstalled" integer,
    IN "_fbVersion" character varying,
    IN "_pipelines" character varying,
    IN "_installedShippers" text -- DEFAULT '[]'
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
        "_uid"
        ,"_name"
        ,"_hostname"
        ,COALESCE("_port", 0)
        ,"_authenticationMethod"
        ,"_username"
        ,"_password"
        ,"_privateKey"
        ,"_osVersion"
        ,"_ocInstalled" = 1
        ,"_ocVersion"
        ,"_fbInstalled" = 1
        ,"_fbVersion"
        ,COALESCE("_installedShippers", '[]')
    )
    ON CONFLICT ("uid") DO
        UPDATE SET
            "name" = "_name"
            ,"hostname" = "_hostname"
            ,"port" = "_port"
            ,"authenticationMethod" = "_authenticationMethod"
            ,"username" = "_username"
            ,"password" = CASE WHEN "_password" != '** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **' THEN "_password" ELSE oc."password" END
            ,"privateKey" = CASE WHEN "_privateKey" != '** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **' THEN "_privateKey" ELSE oc."privateKey" END
            ,"osVersion" = "_osVersion"
            ,"ocInstalled" = "_ocInstalled" = 1
            ,"ocVersion" = "_ocVersion"
            ,"fbInstalled" = "_fbInstalled" = 1
            ,"fbVersion" = "_fbVersion"
            ,"installedShippers" = COALESCE("_installedShippers", '[]')
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

