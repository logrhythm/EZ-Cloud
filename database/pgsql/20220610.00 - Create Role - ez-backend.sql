-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-10
-- Modified on: 2022-07-08 - To deal with repeat runs and logging
-- =============================================

DO
$scooby_doo$
BEGIN
  IF EXISTS (
    SELECT
      FROM pg_catalog.pg_roles
    WHERE
      rolname = 'ez-backend'
  )
  THEN
    RAISE NOTICE '% - Role "ez-backend" already exists. Skipping.', clock_timestamp()::TEXT;
  ELSE
    EXECUTE FORMAT(
      '
        CREATE ROLE "ez-backend" WITH
          LOGIN
          PASSWORD %L
          NOSUPERUSER
          INHERIT
          NOCREATEDB
          NOCREATEROLE
          NOREPLICATION;
      ', gen_random_uuid()::TEXT
    );

    RAISE NOTICE '% - Role "ez-backend" succesfully created.', clock_timestamp()::TEXT;
  END IF;
END
$scooby_doo$;