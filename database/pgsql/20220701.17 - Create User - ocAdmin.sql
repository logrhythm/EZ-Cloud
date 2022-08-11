-- =============================================
-- Author:		  Tony Massé
-- Create date: 2022-07-01
-- Modified on: 2022-07-08 - To rename User `ezAdmin` to `ocAdmin`
-- Modified on: 2022-07-26 - Use `OC_ADMIN_PASSWORD` environment variable to create the `ocAdmin` user account
-- =============================================

-- Create the OC Admin User

call public."upsert_RBAC_User" (
    NULL,
    'ocAdmin',
    'b7972c45-3546-4993-93ab-c0f1d9a0ffae', -- Admin role
    COALESCE(:'OC_ADMIN_PASSWORD', gen_random_uuid()::TEXT) -- Try to use `OC_ADMIN_PASSWORD` environment variable. Fail that, generate a random password
);
