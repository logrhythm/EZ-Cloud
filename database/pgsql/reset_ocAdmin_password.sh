#!/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-08-19
# Modified on: 2022-07-26 - To use `OC_ADMIN_PASSWORD` environment variable to create the `ocAdmin` user account
# Description: Reset the password for Admin User `ocAdmin` to either the new pass in `OC_ADMIN_PASSWORD` environment variable
#              or a randomly generated password.
#              Optional: A different login name can be provided in `OC_ADMIN_LOGIN` environment variable. If none, default
#              `ocAdmin` is used instead.
#              If `ocAdmin` account doesn't exist anymore, a new one, with the provided password will be created.
#              If the default `Admin` Role doesn't exist anymore, a new one will be created.
# =============================================

# Check Postgres is already running
found=$(docker ps --no-trunc | grep "oc-db")
if [[ ! -z "$found" ]]; then
  # Reset ocAdmin password
  cat "20220819. - Reset OCAdmin Password.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin --set=OC_ADMIN_LOGIN="$OC_ADMIN_LOGIN" --set=OC_ADMIN_PASSWORD="$OC_ADMIN_PASSWORD"
fi
