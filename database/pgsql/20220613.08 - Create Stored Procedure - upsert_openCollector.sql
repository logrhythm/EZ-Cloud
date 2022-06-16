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
    IN "@privateKey" text,
    IN "@osVersion" character varying,
    IN "@ocInstalled" integer,
    IN "@ocVersion" character varying,
    IN "@fbInstalled" integer,
    IN "@fbVersion" character varying,
    IN "@pipelines" text,
    IN "@installedShippers" text -- DEFAULT '[]'
)
LANGUAGE plpgsql
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
    DECLARE
        pipelines_json json;
        affected_rows bigint;
    BEGIN
        -- Extract the JSON is provided and valid, raise exception otherwise
        pipelines_json := ("@pipelines"::json);
        RAISE NOTICE 'JSON array of Pipeline objects was provided and valid';

        -- Clean Up
        DELETE FROM "public"."openCollectorsPipelines"
            WHERE "openCollectorUid" = "@uid";
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Deleted openCollectorsPipelines %', affected_rows;

        -- Inject back in
        INSERT INTO public."openCollectorsPipelines"
            SELECT 
                "@uid" AS "openCollectorUid",
                "uid" AS "pipelineUid",
                "enabled" AS "state"
            FROM json_to_recordset(pipelines_json)
            AS x(
                "uid" text,
                "enabled" smallint
                );
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Inserted openCollectorsPipelines %', affected_rows;

        -- BOOM!
        RAISE NOTICE 'Commited';
    EXCEPTION
        WHEN others THEN
            NULL; -- Fails silently
    END;

END;
$BODY$;


ALTER PROCEDURE public."upsert_openCollector"
    OWNER TO "ez-backend";

GRANT EXECUTE ON PROCEDURE public."upsert_openCollector"
    TO "ez-backend";

REVOKE ALL ON PROCEDURE public."upsert_openCollector"
    FROM PUBLIC;
