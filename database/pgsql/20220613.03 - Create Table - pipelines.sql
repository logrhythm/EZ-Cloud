-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-13
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- =============================================

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

ALTER TABLE IF EXISTS public."pipelines"
    OWNER to "oc-admin-backend";
