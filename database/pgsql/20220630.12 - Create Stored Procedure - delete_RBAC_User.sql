-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-30
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- Modified on: 2022-08-03 - To add better logging
-- Description:	Delete a User in `rbacUserToRole`, based on its ID, and in SQL
-- =============================================

RAISE NOTICE '% - Create/Update Stored Procedure "delete_RBAC_User" ownership and indices, if necessary.', clock_timestamp()::TEXT;
DROP PROCEDURE IF EXISTS public."delete_RBAC_User";

CREATE PROCEDURE public."delete_RBAC_User"
(
    "@userID" integer = NULL -- If none is provided, we just do nothing
)
LANGUAGE plpgsql
AS $BODY$
DECLARE
    "@userLogin" character varying(500);
BEGIN
    IF "@userID" IS NOT NULL
    THEN
        -- Get @userLogin for specific @userId
        SELECT "login"
            INTO "@userLogin"
            FROM public."rbacUserToRole"
            WHERE "id" = "@userID";

        IF "@userLogin" IS NOT NULL 
        THEN
            -- Delete record for User in [rbacUserToRole]
            DELETE FROM public."rbacUserToRole" WHERE "login" = "@userLogin";

            -- Delete the User login
            IF EXISTS (
                SELECT FROM pg_catalog.pg_roles WHERE rolname = "@userLogin"
            )
            THEN
                EXECUTE format('
                    DROP ROLE IF EXISTS %I;
                    ',
                    "@userLogin"
                );
            END IF;
        END IF;
    END IF;
END
$BODY$;

RAISE NOTICE '% - Stored Procedure "delete_RBAC_User" succesfully created/updated.', clock_timestamp()::TEXT;
RAISE NOTICE '% - Update Stored Procedure "delete_RBAC_User" ownership and access rights, if necessary.', clock_timestamp()::TEXT;

ALTER PROCEDURE public."delete_RBAC_User"
    OWNER TO "postgres";

GRANT EXECUTE ON PROCEDURE public."delete_RBAC_User"
    TO "oc-admin-backend";

REVOKE ALL ON PROCEDURE public."delete_RBAC_User"
    FROM PUBLIC;

RAISE NOTICE '% - Stored Procedure "delete_RBAC_User" ownership and access rights updated.', clock_timestamp()::TEXT;

-- =============================================
-- Tests
-- =============================================

-- -- Assuming the User has ID 3:

-- call public."delete_RBAC_User" (3);
