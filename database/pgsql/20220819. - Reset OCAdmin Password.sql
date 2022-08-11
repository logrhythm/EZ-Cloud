-- =============================================
-- Author:		  Tony Massé
-- Create date: 2022-08-19
-- Modified on: 2022-08-22 - To Dumb down and use "format" to mix PgSql and environment variable
-- Description: Reset the Password for Role `ocAdmin` with provided new password
--              provided in `OC_ADMIN_PASSWORD` environment variable.
--              If no `OC_ADMIN_PASSWORD` is provided, it will use a random password.
-- =============================================

-- Reset the Password for the OC Admin User

SELECT format($$
DO
$BODY$
DECLARE
    "@lowerCaseUserLogin" character varying(500) = lower('ocAdmin'); -- Use default `ocAdmin`
    "@newPassword" character varying(500) = %L; -- Get `OC_ADMIN_PASSWORD` environment variable as a parameter
    "@userLoginId" integer = NULL;
BEGIN
    RAISE DEBUG '"@lowerCaseUserLogin" = %%', "@lowerCaseUserLogin";

    -- Get the ID of OCAdmin Role
    SELECT rutr."id"
        INTO "@userLoginId"
        FROM public."rbacUserToRole" rutr
        WHERE rutr."login" = "@lowerCaseUserLogin"; -- Must be lowercase

    RAISE DEBUG '"@userLoginId" = %%', "@userLoginId";

    RAISE NOTICE 'Reseting Password for User Login "%%" (Found as ID "%%")', "@lowerCaseUserLogin", "@userLoginId";

    -- Change its password
    call public."upsert_RBAC_User" (
        "@userLoginId",
        "@lowerCaseUserLogin",
        'b7972c45-3546-4993-93ab-c0f1d9a0ffae', -- Admin role
        COALESCE("@newPassword", gen_random_uuid()::TEXT) -- Try to use `OC_ADMIN_PASSWORD` environment variable. Fail that, generate a random password
    );
    RAISE NOTICE 'DONE';

    IF NOT EXISTS (
            SELECT FROM public."rbacRoles" WHERE "uid" = 'b7972c45-3546-4993-93ab-c0f1d9a0ffae', -- Admin role
        )
        THEN
            RAISE WARNING 'ERROR - Default Admin Role is missing';
            RAISE NOTICE 'INFO - Recreating default Admin Role...';

            CALL public."upsert_RBAC_Role" (
                'b7972c45-3546-4993-93ab-c0f1d9a0ffae'
                , 'Admin'
                , TRUE -- Admin
            );

            RAISE NOTICE 'DONE';
        END IF;
END
$BODY$;
$$, COALESCE(:'OC_ADMIN_PASSWORD', gen_random_uuid()::TEXT))\gexec
