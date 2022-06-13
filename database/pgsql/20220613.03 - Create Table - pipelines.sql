-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-13
-- =============================================

CREATE TABLE IF NOT EXISTS public."pipelines"
(
    "uid" varchar(40) NOT NULL,
    "name" varchar(50) NULL,
    "status" boolean NOT NULL,
    "primaryOpenCollector" varchar(40) NULL,
    "fieldsMappingJson" text NULL,
    "collectionConfigJson" text NULL,
    "optionsJson" text NULL,
    PRIMARY KEY ("uid")
);

ALTER TABLE IF EXISTS public."pipelines"
    OWNER to "ez-backend";
