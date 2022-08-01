-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-30
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- Modified on: 2022-07-14 - To make `name` optional on updates
-- Description:	Upsert Setting record, based on its UID
-- =============================================

DROP PROCEDURE IF EXISTS public."upsert_Setting";

CREATE PROCEDURE public."upsert_Setting"
(
    "@uid" character varying = NULL,
    "@name" character varying = NULL,
    "@description" character varying = NULL,
    "@settingsJson" text = NULL
)
LANGUAGE plpgsql
AS $BODY$
BEGIN
    INSERT INTO public."settings" AS s
    (
        "uid",
        "name",
        "description",
        "settingsJson"
    )
    VALUES
    (
        "@uid",
        "@name",
        "@description",
        "@settingsJson"
    )
    ON CONFLICT ("uid") DO
        UPDATE SET
            "name" = COALESCE("@name", s."name") -- If provided NULL for these, we re-use the current value
            ,"description" = COALESCE("@description", s."description") -- If provided NULL for these, we re-use the current value
            ,"settingsJson" = COALESCE("@settingsJson", s."settingsJson") -- If provided NULL for these, we re-use the current value
    ;
END
$BODY$;

ALTER PROCEDURE public."upsert_Setting"
    OWNER TO "oc-admin-backend";

GRANT EXECUTE ON PROCEDURE public."upsert_Setting"
    TO "oc-admin-backend";

REVOKE ALL ON PROCEDURE public."upsert_Setting"
    FROM PUBLIC;