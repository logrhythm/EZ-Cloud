-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-10
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- Modified on: 2022-07-08 - To rename the `ez` database to `oc-admin`
-- =============================================

CREATE DATABASE "oc-admin"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

GRANT ALL ON DATABASE "oc-admin" TO postgres;

GRANT TEMPORARY ON DATABASE "oc-admin" TO "oc-admin-backend";

GRANT TEMPORARY, CONNECT ON DATABASE "oc-admin" TO PUBLIC;