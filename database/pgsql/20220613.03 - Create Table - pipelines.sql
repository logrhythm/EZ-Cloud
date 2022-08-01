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
      tablename = 'pipelines'
  )
  THEN
    RAISE NOTICE '% - Table "pipelines" already exists. Skipping.', clock_timestamp()::TEXT;
  ELSE
    CREATE TABLE IF NOT EXISTS public."pipelines"
    (
        "uid" varchar(40) NOT NULL,
        "name" varchar(50) NULL,
        "status" smallint NOT NULL,
        "primaryOpenCollector" varchar(40) NULL,
        "fieldsMappingJson" text NULL,
        "collectionConfigJson" text NULL,
        "optionsJson" text NULL,
        PRIMARY KEY ("uid")
    );

    RAISE NOTICE '% - Table "pipelines" succesfully created.', clock_timestamp()::TEXT;
  END IF;

  RAISE NOTICE '% - Update table "pipelines" ownership, if necessary.', clock_timestamp()::TEXT;
  ALTER TABLE IF EXISTS public."pipelines"
      OWNER to "oc-admin-backend";
END
$scooby_doo$;
