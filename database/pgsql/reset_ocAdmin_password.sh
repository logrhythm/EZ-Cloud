#!/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-08-19
# Description: Reset the password for Admin User `ocAdmin` to either the new pass in `OC_ADMIN_PASSWORD` environment variable
#              or a randomly generated password.
#              If `ocAdmin` account doesn't exist anymore, a new one, with the provided password will be created.
#              If the default `Admin` Role doesn't exist anymore, a new one will be created.
# =============================================

# Check Postgres is already running
found=$(docker ps --no-trunc | grep "oc-db")
if [[ ! -z "$found" ]]; then
  # Reset ocAdmin password
  cat "20220819. - Reset OCAdmin Password.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin --set=OC_ADMIN_PASSWORD="$OC_ADMIN_PASSWORD"
fi
