#!/usr/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-08
# Modified on: 2022-07-26 - To add header and description
# Description: Pull and Start Production version of the OC-Admin container `oc-admin`.
# =============================================

echo "### RUN \`oc-admin\` CONTAINER..."
docker run --detach --publish 8400:8400/tcp --network logrhythm --name oc-admin tonymasse/oc-admin
