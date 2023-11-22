#!/usr/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-11
# Description: Create the named volume and Start PostgreSQL container `oc-db`
# =============================================

# To be ran on the Docker host to start this container

echo "### Create \`oc-db\` Volume..."
docker volume create oc-db

echo "### Create/Start OC-DB (\`oc-db\`) container for PostgreSQL using \`oc-db\` Volume..."
docker run --network logrhythm --env POSTGRES_PASSWORD=`date --rfc-3339=ns | md5sum | cut -c-32` --name oc-db --volume oc-db:/var/lib/postgresql/data --detach --restart always tonymasse/oc-db

echo "### Done."
