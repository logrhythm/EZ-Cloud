-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-13
-- =============================================

DROP PROCEDURE IF EXISTS public."upsert_openCollector";

CREATE PROCEDURE public."upsert_openCollector"
(
    IN "uid" character varying,
    IN "name" character varying,
    IN "hostname" character varying,
    IN "port" integer, --  DEFAULT 0
    IN "authenticationMethod" character varying,
    IN "username" character varying,
    IN "password" character varying,
    IN "privateKey" character varying,
    IN "osVersion" character varying,
    IN "ocInstalled" integer,
    IN "ocVersion" character varying,
    IN "fbInstalled" integer,
    IN "fbVersion" character varying,
    IN "pipelines" character varying,
    IN "installedShippers" text -- DEFAULT '[]'
)
LANGUAGE 'sql'
AS $BODY$
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
        "uid"
        ,"name"
        ,"hostname"
        ,COALESCE("port", 0)
        ,"authenticationMethod"
        ,"username"
        ,"password"
        ,"privateKey"
        ,"osVersion"
        ,"ocInstalled" = 1
        ,"ocVersion"
        ,"fbInstalled" = 1
        ,"fbVersion"
        ,COALESCE("installedShippers", '[]')
    )
    ON CONFLICT ("uid") DO
        UPDATE SET
            "name" = "upsert_openCollector"."name"
            ,"hostname" = "upsert_openCollector"."hostname"
            ,"port" = "upsert_openCollector"."port"
            ,"authenticationMethod" = "upsert_openCollector"."authenticationMethod"
            ,"username" = "upsert_openCollector"."username"
            ,"password" = CASE
                WHEN "upsert_openCollector"."password" != '** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **'
                THEN "upsert_openCollector"."password"
                ELSE oc."password"
                END
            ,"privateKey" = CASE
                WHEN "upsert_openCollector"."privateKey" != '** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **'
                THEN "upsert_openCollector"."privateKey"
                ELSE oc."privateKey"
                END
            ,"osVersion" = "upsert_openCollector"."osVersion"
            ,"ocInstalled" = "upsert_openCollector"."ocInstalled" = 1
            ,"ocVersion" = "upsert_openCollector"."ocVersion"
            ,"fbInstalled" = "upsert_openCollector"."fbInstalled" = 1
            ,"fbVersion" = "upsert_openCollector"."fbVersion"
            ,"installedShippers" = COALESCE("upsert_openCollector"."installedShippers", '[]')
    ;
$BODY$;

ALTER PROCEDURE public."upsert_openCollector"
    OWNER TO "ez-backend";

GRANT EXECUTE ON PROCEDURE public."upsert_openCollector"
    TO "ez-backend";

REVOKE ALL ON PROCEDURE public."upsert_openCollector"
    FROM PUBLIC;

-- CALL public."upsert_openCollector"(
-- 	'<IN uid',
-- 	'<IN name character varying>',
-- 	'<IN hostname character varying>', 
-- 	0, -- <IN port integer>, 
-- 	'<IN "authenticationMethod" character varying>',
-- 	'<IN username character varying>', 
-- 	'<IN password character varying>', 
-- 	'<IN "privateKey" character varying>', 
-- 	'<IN "osVersion" character varying>',
-- 	0, -- <IN "ocInstalled" smallint>, 
-- 	'<IN "ocVersion" character varying>',
-- 	0, -- <IN "fbInstalled" smallint>, 
-- 	'<IN "fbVersion" character varying>',
-- 	'<IN pipelines character varying>', 
-- 	'<IN "installedShippers" text>'
-- )