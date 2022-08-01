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
      tablename = 'states'
  )
  THEN
    RAISE NOTICE '% - Table "states" already exists. Skipping.', clock_timestamp()::TEXT;
  ELSE
    CREATE TABLE IF NOT EXISTS public."states"
    (
        "id" smallint NOT NULL,
        "name" varchar(50) NOT NULL,
        PRIMARY KEY ("id")
    );

    RAISE NOTICE '% - Table "states" succesfully created.', clock_timestamp()::TEXT;
  END IF;

  RAISE NOTICE '% - Update table "states" ownership and indices, if necessary.', clock_timestamp()::TEXT;
  ALTER TABLE IF EXISTS public."states"
      OWNER to "oc-admin-backend";

  CREATE INDEX IF NOT EXISTS "IX_states_name"
      ON public."states" USING btree
      ("name" ASC NULLS LAST)
      INCLUDE("id")
  ;

  RAISE NOTICE '% - Update table "states" content.', clock_timestamp()::TEXT;
  INSERT INTO public."states"("id", "name") VALUES (0, 'Disabled') ON CONFLICT ("id") DO NOTHING;
  INSERT INTO public."states"("id", "name") VALUES (1, 'Enabled') ON CONFLICT ("id") DO NOTHING;
  INSERT INTO public."states"("id", "name") VALUES (2, 'New') ON CONFLICT ("id") DO NOTHING;
  INSERT INTO public."states"("id", "name") VALUES (3, 'Dev') ON CONFLICT ("id") DO NOTHING;
  INSERT INTO public."states"("id", "name") VALUES (4, 'Ready') ON CONFLICT ("id") DO NOTHING;
  INSERT INTO public."states"("id", "name") VALUES (5, 'Locked') ON CONFLICT ("id") DO NOTHING;
  INSERT INTO public."states"("id", "name") VALUES (6, 'Absent') ON CONFLICT ("id") DO NOTHING;
  INSERT INTO public."states"("id", "name") VALUES (7, 'Installed') ON CONFLICT ("id") DO NOTHING;
  INSERT INTO public."states"("id", "name") VALUES (8, 'Running') ON CONFLICT ("id") DO NOTHING;
  RAISE NOTICE '% - Table "states" content updated.', clock_timestamp()::TEXT;

END
$scooby_doo$;
