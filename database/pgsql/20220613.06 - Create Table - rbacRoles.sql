-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-13
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- Modified on: 2022-08-03 - To add better logging
-- =============================================

DO
$scooby_doo$
BEGIN
  IF EXISTS (
    SELECT
      FROM pg_catalog.pg_tables
    WHERE
      schemaname='public'
      AND
      tablename = 'rbacRoles'
  )
  THEN
    RAISE NOTICE '% - Table "rbacRoles" already exists. Skipping.', clock_timestamp()::TEXT;
  ELSE
    CREATE TABLE IF NOT EXISTS public."rbacRoles"
    (
        "uid" varchar(40) NOT NULL,
        "name" varchar(200) NOT NULL,
        "isPrivileged" boolean NOT NULL DEFAULT FALSE,
        PRIMARY KEY ("uid")
    );
    RAISE NOTICE '% - Table "rbacRoles" succesfully created.', clock_timestamp()::TEXT;
  END IF;

  RAISE NOTICE '% - Update table "rbacRoles" ownership, if necessary.', clock_timestamp()::TEXT;

  ALTER TABLE IF EXISTS public."rbacRoles"
      OWNER to "oc-admin-backend";

  RAISE NOTICE '% - Update table "rbacRoles" content: Create the basic roles.', clock_timestamp()::TEXT;

  -- Create the basic roles
  INSERT
      INTO public."rbacRoles"("uid", "name", "isPrivileged")
      VALUES (
          'b7972c45-3546-4993-93ab-c0f1d9a0ffae'
          ,'Admin'
          ,TRUE
      )
      ON CONFLICT ("uid") DO NOTHING;

  INSERT
      INTO public."rbacRoles"("uid", "name", "isPrivileged")
      VALUES (
          'cb36e823-e68f-46aa-9dc1-71c35cae43b5'
          ,'User'
          ,FALSE
      )
      ON CONFLICT ("uid") DO NOTHING;
  RAISE NOTICE '% - Table "rbacRoles" content updated.', clock_timestamp()::TEXT;

END
$scooby_doo$;
