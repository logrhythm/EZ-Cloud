#!/usr/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-11
# Modified on: 2022-07-26 - To add --nopublish parameter and feature
# Description: Create the named volume and Start PostgreSQL container `oc-db`
# Parameters:
#  --help         Shows Help message
#  --nopublish    Skips publishing to Docker Hub
# =============================================

# Display Help message
if [[ "$*" == *help* ]]; then
  echo ""
  echo "Usage:  _docker.build-oc-db.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "   --help                Shows this help"
  echo "   --nopublish           Skips publishing to Docker Hub"
  echo ""
  exit 0
fi

echo "### BUILD DOCKER IMAGE..."
docker build -t tonymasse/oc-db:v1.0 -t tonymasse/oc-db:latest ./

echo "### Done."

if [[ "$*" == *nopublish* ]]; then
  echo "### SKIPPING PUBLISHING, as per \`--nopublish\` parameter."
  echo "### Next steps for you are likely to be:"
  echo "docker login"
  echo "docker push --all-tags tonymasse/oc-db"
else
  echo "### PUBLISHING \`oc-db\` CONTAINER IMAGE..."
  docker push --all-tags tonymasse/oc-db

  echo "### 🟢🏁 PUBLISH PROCESS COMPLETE."
fi
