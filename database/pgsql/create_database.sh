#!/bin/env bash

# =============================================
# Author:		Tony Massé
# Create date: 2022-07-08
# Modified on: 2022-07-08 - To rename the `ez` database to `oc-admin`
# Modified on: 2022-07-08 - To rename User `ezAdmin` to `ocAdmin`
# Modified on: 2022-07-26 - To use `OC_ADMIN_PASSWORD` environment variable to create the `ocAdmin` user account
# Description: Create the User, DB, Tables, Views, Stored Procedure, Functions and there ancilaries in PostgreSQL container `oc-db`
# =============================================

# Check Postgres is already running
found=$(docker ps --no-trunc | grep "oc-db")
if [[ ! -z "$found" ]]; then
  # Create the User, DB and its ancilaries
  docker exec -i oc-db psql --username=postgres --dbname postgres --command="CREATE EXTENSION pgcrypto;"
  cat "20220610.00 - Create Role - oc-admin-backend.sql" | docker exec -i oc-db psql --username=postgres --dbname postgres
  cat "20220610.01 - Create DB.sql" | docker exec -i oc-db psql --username=postgres --dbname postgres
  cat "20220610.02 - Create Table - openCollectors.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220613.03 - Create Table - pipelines.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220613.04 - Create Table - states.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220613.05 - Create Table - openCollectorsPipelines.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220613.06 - Create Table - rbacRoles.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220613.07 - Create Table - rbacUserToRoles.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220613.08 - Create Stored Procedure - upsert_openCollector.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220624.09 - Create Function - fn_Get_State_Id.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220624.10 - Create Stored Procedure - upsert_pipeline.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220629.11 - Create Stored Procedure - upsert_RBAC_User.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220630.12 - Create Stored Procedure - delete_RBAC_User.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220630.13 - Create Stored Procedure - upsert_RBAC_Role.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220630.14 - Create Stored Procedure - delete_RBAC_Role.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220630.15 - Create Table - settings.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220630.16 - Create Stored Procedure - upsert_Setting.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
  cat "20220701.17 - Create User - ocAdmin.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin --set=OC_ADMIN_PASSWORD="$OC_ADMIN_PASSWORD"
  cat "20220701.18 - Create View - get_SIEM_Master_ID.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
fi


