-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-30
-- Description:	Delete Role record, based on its UID
-- =============================================

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
$BODY$

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
