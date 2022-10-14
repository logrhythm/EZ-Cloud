-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-10
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- Modified on: 2022-09-20 - To add `dockerVersion` column
-- =============================================

CREATE TABLE IF NOT EXISTS public."openCollectors"
(
    "uid" varchar(40) NOT NULL,
    "name" varchar(50) NULL,
    "hostname" varchar(50) NULL,
    "port" integer NULL,
    "authenticationMethod" varchar(15) NULL,
    "username" varchar(100) NULL,
    "password" varchar(250) NULL,
    "privateKey" text NULL,
    "osVersion" varchar(100) NULL,
    "dockerVersion" varchar(100) NULL,
    "ocInstalled" boolean NULL,
    "ocVersion" varchar(100) NULL,
    "fbInstalled" boolean NULL,
    "fbVersion" varchar(100) NULL,
    "installedShippers" text NOT NULL,
    PRIMARY KEY ("uid")
);

ALTER TABLE IF EXISTS public."openCollectors"
    OWNER to "oc-admin-backend";

-- Adding `dockerVersion` to table if it's from an old version
ALTER TABLE IF EXISTS public."openCollectors"
    ADD COLUMN IF NOT EXISTS "dockerVersion" varchar(100) NULL;
