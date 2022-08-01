-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-13
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- Modified on: 2022-07-08 - To rename User `ezAdmin` to `ocAdmin`
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
      tablename = 'rbacUserToRole'
  )
  THEN
    RAISE NOTICE '% - Table "rbacUserToRole" already exists. Skipping.', clock_timestamp()::TEXT;
  ELSE
    CREATE TABLE IF NOT EXISTS public."rbacUserToRole"
    (
        "id" int NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 ),
        "login" varchar(500) NOT NULL,
        "roleUid" varchar(40) NOT NULL,
        "publisherUid" varchar(40) NOT NULL DEFAULT (gen_random_uuid()),
        PRIMARY KEY (id),
        CONSTRAINT "U_login" UNIQUE (login)
    );
    RAISE NOTICE '% - Table "rbacUserToRole" succesfully created.', clock_timestamp()::TEXT;
  END IF;

  RAISE NOTICE '% - Update table "rbacUserToRole" ownership and indices, if necessary.', clock_timestamp()::TEXT;
  ALTER TABLE IF EXISTS public."rbacUserToRole"
      OWNER to "oc-admin-backend";
END
$scooby_doo$;


-- Create the basic role mapping for ocAdmin
-- INSERT
--     INTO public."rbacUserToRole"("login", "roleUid")
--     VALUES (
--         'ocAdmin'
--         ,'b7972c45-3546-4993-93ab-c0f1d9a0ffae'
--     )
--     ON CONFLICT ("login") DO NOTHING;
