-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-10
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- Modified on: 2022-07-08 - To rename the `ez` database to `oc-admin`
-- Modified on: 2022-08-03 - To add better logging
-- =============================================

DO
$scooby_doo$
BEGIN
  IF EXISTS (
    SELECT
      FROM pg_catalog.pg_database
    WHERE
      datname = 'oc-admin'
  )
  THEN
    RAISE NOTICE '% - Database "oc-admin" already exists. Skipping.', clock_timestamp()::TEXT;
  ELSE
    CREATE DATABASE "oc-admin"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

    RAISE NOTICE '% - Database "oc-admin" succesfully created.', clock_timestamp()::TEXT;
  END IF;

  RAISE NOTICE '% - Setting up database "oc-admin" access rights.', clock_timestamp()::TEXT;
  GRANT ALL ON DATABASE "oc-admin" TO postgres;

  GRANT TEMPORARY ON DATABASE "oc-admin" TO "oc-admin-backend";

  GRANT TEMPORARY, CONNECT ON DATABASE "oc-admin" TO PUBLIC;

  RAISE NOTICE '% - Access rights for database "oc-admin" succesfully setup.', clock_timestamp()::TEXT;
END
$scooby_doo$;