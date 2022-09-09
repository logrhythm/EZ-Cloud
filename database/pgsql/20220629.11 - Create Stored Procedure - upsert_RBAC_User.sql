-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-29
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- Modified on: 2022-08-19 - To allow to change the password of an existing user
-- Description:	Create a User in SQL and Insert or Update it in `rbacUserToRole`, based on its ID
-- =============================================

DROP PROCEDURE IF EXISTS public."upsert_RBAC_User";

CREATE PROCEDURE public."upsert_RBAC_User"
(
    "@userID" integer = NULL, -- If none is provided, we create a new User
    "@userLogin" character varying = NULL, -- Only used when creating a new User
    "@roleUid" character varying = NULL,
    "@userPassword" text = NULL -- Only used when creating a new User
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $BODY$
DECLARE
    "@sqlStatement" text;
    "@tempUserLogin" character varying(500);
    "@lowerCaseUserLogin" character varying(500) = lower("@userLogin");
BEGIN
	-- WORKFLOW:
	-- If userID is NULL, then:
	-- - double check the Login doesn't already exist in SQL (for any DB, as we do not want to mess with existing accounts)
	-- - if Login not found anywhere:
	-- -- create the User in SQL
    -- Else (UserID was not NULL):
    -- - Check the @userPassword 
    -- - if it contains something else than the normal placeholder, then:
    -- -- update the password of the user in SQL
	-- If userLogin exists as an SQL User and is already in rbacUserToToles:
	-- - update the entry in rbacUserToToles
	-- If userLogin exists as an SQL User and is not yet in rbacUserToToles:
	-- - add an entry in rbacUserToToles


    IF "@userID" IS NULL THEN
        RAISE DEBUG '"@userID" IS NULL';
        IF NOT EXISTS (
            SELECT FROM pg_catalog.pg_roles WHERE rolname = "@lowerCaseUserLogin"
        )
        THEN
            RAISE DEBUG '"%" does not exist yet', "@lowerCaseUserLogin";
            IF 
                "@lowerCaseUserLogin" IS NOT NULL
                AND "@userPassword" IS NOT NULL 
                THEN
                RAISE DEBUG 'Creating Role "%"', "@lowerCaseUserLogin"; -- XXXX

                EXECUTE format('
                    CREATE ROLE %I
                        WITH
                            LOGIN
                            NOSUPERUSER
                            NOCREATEDB
                            NOCREATEROLE
                            NOINHERIT
                            NOREPLICATION
                            NOBYPASSRLS
                            PASSWORD %L
                            CONNECTION LIMIT 10 -- Tempted to put 1, but we might see edgecases where the user is not logged out immediately
                        ;
                    ',
                    "@lowerCaseUserLogin",
                    "@userPassword"
                );

            END IF;
            RAISE DEBUG 'Done';
        ELSE
            RAISE WARNING 'ERROR - User already exists: "%"', "@lowerCaseUserLogin";
            RAISE NOTICE 'INFO - EZ Server only allows using non already exisiting User Login';
            RAISE EXCEPTION 'User Login already exists. EZ Server only uses new User Login.' USING ERRCODE = '51001';
        END IF;
        -- As we came here with OUT a userId, we use the userLogin from the parameter
        "@tempUserLogin" := "@lowerCaseUserLogin";
    ELSE
        RAISE DEBUG '"@userID" IS not NULL';
        -- As we came here WITH a userId, we use the userLogin from the Table, based on the userId
        SELECT rutr."login"
            INTO "@tempUserLogin"
            FROM public."rbacUserToRole" rutr
            WHERE rutr."id" = "@userID";

        -- Else (UserID was not NULL):
        -- - Check the @userPassword 
        -- - if it contains something else than the normal placeholder, then:
        -- -- update the password of the user in SQL
        IF 
            "@userPassword" IS NOT NULL
            AND NULLIF("@userPassword", '** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **') IS NOT NULL 
            THEN
            RAISE DEBUG 'Checking "%" exists, prior to udpdate its Password', "@lowerCaseUserLogin"; -- XXXX
            IF EXISTS (
                    SELECT FROM pg_catalog.pg_roles WHERE rolname = "@tempUserLogin"
            )
            THEN
                RAISE DEBUG 'Updating Password for Role "%"', "@tempUserLogin"; -- XXXX
                EXECUTE format('
                    ALTER ROLE %I
                        WITH
                            PASSWORD %L
                        ;
                    ',
                    "@tempUserLogin",
                    "@userPassword"
                );
                RAISE DEBUG 'Done';
            ELSE
                RAISE WARNING 'ERROR - User Login "%" did not exist. Not possible to udpdate its Password', "@tempUserLogin"; -- XXXX
                RAISE EXCEPTION 'User Login not found. OC Admin can only modify the password of existing User Login.' USING ERRCODE = '51002';
            END IF;
        END IF;
    END IF;
    RAISE DEBUG '@tempUserLogin is now "%"', "@tempUserLogin";

    -- If userLogin exists as an SQL User and is already in rbacUserToToles:
    -- - update the entry in rbacUserToToles
    -- If userLogin exists as an SQL User and is not yet in rbacUserToToles:
    -- - add an entry in rbacUserToToles
    IF EXISTS (
            SELECT FROM pg_catalog.pg_roles WHERE rolname = "@tempUserLogin"
    )
    THEN
        IF EXISTS 
            (SELECT *
                FROM public."rbacUserToRole"
                WHERE "id" = "@userID")
        THEN
            UPDATE public."rbacUserToRole"
                SET 
                    -- "login" = "@tempUserLogin", -- We do not allow for login/user rename
                    "roleUid" = "@roleUid"
                WHERE "id" = "@userID";
        ELSE
                INSERT INTO public."rbacUserToRole"
                ("login", "roleUid") VALUES ("@tempUserLogin", "@roleUid")
                ON CONFLICT ("login") DO -- Rare edgecase where someone tries to create the same user again
                    UPDATE SET
                    "roleUid" = "@roleUid";
        END IF;
    END IF;
END;
$BODY$;

ALTER PROCEDURE public."upsert_RBAC_User"
    OWNER TO "postgres";

GRANT EXECUTE ON PROCEDURE public."upsert_RBAC_User"
    TO "oc-admin-backend";

REVOKE ALL ON PROCEDURE public."upsert_RBAC_User"
    FROM PUBLIC;

-- =============================================
-- Tests
-- =============================================

-- -- Create a new user

-- call public."upsert_RBAC_User" (
--     NULL,
--     'EZ_Test_User',
--     'cb36e823-e68f-46aa-9dc1-71c35cae43b5', -- User role
--     'P4ssw0rd!!Pa55word!!'
-- );

-- -- Try to create it again (should complain about user already existing)

-- call public."upsert_RBAC_User" (
--     NULL,
--     'EZ_Test_User',
--     'cb36e823-e68f-46aa-9dc1-71c35cae43b5', -- User role
--     'P4ssw0rd!!Pa55word!!'
-- );

-- -- Update the User's RBAC role/group (assuming UserID is 15)

-- call public."upsert_RBAC_User" (
--     15,
--     NULL,
--     'abcde823-e68f-46aa-9dc1-71c35cae43b5', -- New User role
--     NULL
-- );

-- -- Update the User's Password (assuming UserID is 15)

-- call public."upsert_RBAC_User" (
--     15,
--     NULL,
--     'cb36e823-e68f-46aa-9dc1-71c35cae43b5', -- User role
--     'New__P4ssw0rd!!Pa55word!!'
-- );
