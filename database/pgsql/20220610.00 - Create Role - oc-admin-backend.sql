-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-10
-- Modified on: 2022-07-08 - To deal with repeat runs and logging
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- =============================================

DO
$scooby_doo$
BEGIN
  IF EXISTS (
    SELECT
      FROM pg_catalog.pg_roles
    WHERE
      rolname = 'oc-admin-backend'
  )
  THEN
    RAISE NOTICE '% - Role "oc-admin-backend" already exists. Skipping.', clock_timestamp()::TEXT;
  ELSE
    EXECUTE FORMAT(
      '
        CREATE ROLE "oc-admin-backend" WITH
          LOGIN
          PASSWORD %L
          NOSUPERUSER
          INHERIT
          NOCREATEDB
          NOCREATEROLE
          NOREPLICATION;
      ', gen_random_uuid()::TEXT
    );

    RAISE NOTICE '% - Role "oc-admin-backend" succesfully created.', clock_timestamp()::TEXT;
  END IF;
END
$scooby_doo$;