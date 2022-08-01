-- =============================================
-- Author:		  Tony Massé
-- Create date: 2022-07-01
-- Modified on: 2022-07-08 - To rename User `ezAdmin` to `ocAdmin`
-- Modified on: 2022-08-03 - To add better logging
-- =============================================

-- Create the OC Admin User

RAISE NOTICE '% - Create "ocAdmin" user if necessary.', clock_timestamp()::TEXT;

call public."upsert_RBAC_User" (
    NULL,
    'ocAdmin',
    'b7972c45-3546-4993-93ab-c0f1d9a0ffae', -- Admin role
    COALESCE(:'OC_ADMIN_PASSWORD', gen_random_uuid()::TEXT) -- 'CHANGE_ME'
);

RAISE NOTICE '% - User "ocAdmin" succesfully created/updated.', clock_timestamp()::TEXT;
