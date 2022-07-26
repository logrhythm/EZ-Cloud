#!/usr/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-11
# Description: Lock down access to `oc-db` to inside the container
#              and specific containers, based on host name, user
#              name and DB name
# =============================================

cat <<EOT > /var/lib/postgresql/data/pg_hba.conf
# TYPE  DATABASE      USER              ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all           all                                       trust
# IPv4 local connections:
host    all           all               127.0.0.1/32            trust
# IPv6 local connections:
host    all           all               ::1/128                 trust

# OC Admin
# TYPE  DATABASE      USER              ADDRESS                 METHOD
host    oc-admin      oc-admin-backend  oc-admin.logrhythm      trust

# Catch all to secure password authentication
host all all all scram-sha-256
EOT
