-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-30
-- Description:	Upsert Role record, based on its UID
-- =============================================

DROP PROCEDURE IF EXISTS public."upsert_RBAC_Role";

CREATE PROCEDURE public."upsert_RBAC_Role"
(
    "@uid" character varying = NULL,
    "@name" character varying = NULL,
    "@isPrivileged" boolean = FALSE -- Default to FALSE
)
LANGUAGE plpgsql
AS $BODY$
BEGIN
    -- WORKFLOW:
    -- If Role's uid is already in rbacRoles:
    -- - update the entry in rbacRoles
    -- Else:
    -- - add an entry in rbacRoles

    INSERT INTO public."rbacRoles"
    (
        "uid",
        "name",
        "isPrivileged"
    )
    VALUES
    (
        "@uid",
        "@name",
        "@isPrivileged"
    )
    ON CONFLICT ("uid") DO
        UPDATE SET
            "name" = "@name"
            ,"isPrivileged" = "@isPrivileged"
    ;
END
$BODY$

-- #####################

-- Tests

-- CALL public."upsert_RBAC_Role" (
--   '88b3cd68-0086-425f-bbd3-1518b93c07dc'
--   , 'Role Name - Default Priviledge'
--   -- Missing isPrivileged, should default to FALSE
-- );

-- SELECT * FROM public."rbacRoles" WHERE "uid" = '88b3cd68-0086-425f-bbd3-1518b93c07dc';

-- -- Create a proper User Role

-- CALL public."upsert_RBAC_Role" (
--   'c980e997-dea2-4c72-bca0-bac9bfa9db98'
--   , 'Role Name - User Priviledge'
--   , FALSE -- User
-- );

-- SELECT * FROM public."rbacRoles" WHERE "uid" = 'c980e997-dea2-4c72-bca0-bac9bfa9db98';

-- -- Create a proper Admin Role

-- CALL public."upsert_RBAC_Role" (
--   '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3'
--   , 'Role Name - Admin Priviledge'
--   , TRUE -- Admin
-- );

-- SELECT * FROM public."rbacRoles" WHERE "uid" = '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3';

-- -- Update Admin Role's name

-- -- DECLARE @RC int

-- CALL public."upsert_RBAC_Role" (
--   '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3'
--   , 'Role Name - Admin Priviledge - Updated'
--   , TRUE -- Admin
-- );

-- SELECT * FROM public."rbacRoles" WHERE "uid" = '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3';

-- -- Update Admin Role's priviledge

-- CALL public."upsert_RBAC_Role" (
--   '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3'
--   , 'Role Name - Admin Priviledge - Updated - Downgraded'
--   , FALSE -- User
-- );

-- SELECT * FROM public."rbacRoles" WHERE "uid" = '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3';

-- -- Clean up
-- DELETE FROM public."rbacRoles" WHERE "uid" = '88b3cd68-0086-425f-bbd3-1518b93c07dc';
-- DELETE FROM public."rbacRoles" WHERE "uid" = 'c980e997-dea2-4c72-bca0-bac9bfa9db98';
-- DELETE FROM public."rbacRoles" WHERE "uid" = '669a21c1-27fd-40e4-a386-b0ab0e5fb0c3';
