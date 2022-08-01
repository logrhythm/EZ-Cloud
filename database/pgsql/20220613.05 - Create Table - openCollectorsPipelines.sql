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
      tablename = 'openCollectorsPipelines'
  )
  THEN
    RAISE NOTICE '% - Table "openCollectorsPipelines" already exists. Skipping.', clock_timestamp()::TEXT;
  ELSE
    CREATE TABLE IF NOT EXISTS public."openCollectorsPipelines"
    (
        "openCollectorUid" varchar(40) NOT NULL,
        "pipelineUid" varchar(40) NOT NULL,
        "state" smallint NOT NULL DEFAULT 0,
        PRIMARY KEY ("openCollectorUid", "pipelineUid")
    );

    RAISE NOTICE '% - Table "openCollectorsPipelines" succesfully created.', clock_timestamp()::TEXT;

  END IF;

  ALTER TABLE IF EXISTS public."openCollectorsPipelines"
      OWNER to "oc-admin-backend";

  CREATE INDEX IF NOT EXISTS "IX_openCollectorsPipelines_openCollectorUid-pipelineUid"
      ON public."openCollectorsPipelines" USING btree
      ("openCollectorUid" ASC NULLS LAST, "pipelineUid" ASC NULLS LAST)
  ;

  ALTER TABLE IF EXISTS public."openCollectorsPipelines"
      CLUSTER ON "IX_openCollectorsPipelines_openCollectorUid-pipelineUid";
END
$scooby_doo$;
