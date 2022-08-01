-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-30
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- Modified on: 2022-08-03 - To add better logging
-- Description:	Delete Role record, based on its UID
-- =============================================

RAISE NOTICE '% - Create/Update Stored Procedure "delete_RBAC_Role" ownership and indices, if necessary.', clock_timestamp()::TEXT;
DROP PROCEDURE IF EXISTS public."delete_RBAC_Role";

CREATE PROCEDURE public."delete_RBAC_Role"
(
    "@uid" character varying = NULL -- If none is provided, we just do nothing
)
LANGUAGE plpgsql
AS $BODY$
BEGIN
	IF "@uid" IS NOT NULL
	THEN
		-- Delete record for Role in [rbacRoles]
		DELETE FROM public."rbacRoles" WHERE "uid" = "@uid";
	END IF;
END
$BODY$;

RAISE NOTICE '% - Stored Procedure "delete_RBAC_Role" succesfully created/updated.', clock_timestamp()::TEXT;
RAISE NOTICE '% - Update Stored Procedure "delete_RBAC_Role" ownership and access rights, if necessary.', clock_timestamp()::TEXT;

ALTER PROCEDURE public."delete_RBAC_Role"
    OWNER TO "oc-admin-backend";

GRANT EXECUTE ON PROCEDURE public."delete_RBAC_Role"
    TO "oc-admin-backend";

REVOKE ALL ON PROCEDURE public."delete_RBAC_Role"
    FROM PUBLIC;

RAISE NOTICE '% - Stored Procedure "delete_RBAC_Role" ownership and access rights updated.', clock_timestamp()::TEXT;

-- =============================================
-- Tests
-- =============================================

-- -- Should do nothing:

-- CALL public."delete_RBAC_Role" ();

-- -- Creating dummy Role with UID '88b3cd68-0086-425f-bbd3-1518b93c07dd'

-- CALL public."upsert_RBAC_Role" (
--   '88b3cd68-0086-425f-bbd3-1518b93c07dd'
--   , 'Dummy Role - Default Priviledge - For deletion'
--   -- Missing isPrivileged, should default to FALSE
-- );

-- -- Assuming the Role has UID : 88b3cd68-0086-425f-bbd3-1518b93c07dd

-- CALL public."delete_RBAC_Role" (
--    '88b3cd68-0086-425f-bbd3-1518b93c07dd'
-- );
