-- =============================================
-- Author:		  Tony Massé
-- Create date: 2022-07-01
-- =============================================

-- Create the EZ Admin User

call public."upsert_RBAC_User" (
    NULL,
    'ezAdmin',
    'b7972c45-3546-4993-93ab-c0f1d9a0ffae', -- Admin role
    gen_random_uuid()::TEXT -- 'CHANGE_ME'
);
