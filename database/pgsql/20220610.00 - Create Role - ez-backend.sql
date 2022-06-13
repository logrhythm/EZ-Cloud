-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-10
-- =============================================

CREATE ROLE "ez-backend" WITH
  LOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION;
  