-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-30
-- Description:	Delete a User in `rbacUserToRole`, based on its ID, and in SQL
-- =============================================

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
$BODY$

-- -- Tests

-- -- Assuming the User has ID 3:

-- call public."delete_RBAC_User" (3);
