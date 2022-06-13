-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-10
-- =============================================

CREATE DATABASE "ez"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

GRANT ALL ON DATABASE "ez" TO postgres;

GRANT TEMPORARY ON DATABASE "ez" TO "ez-backend";

GRANT TEMPORARY, CONNECT ON DATABASE "ez" TO PUBLIC;