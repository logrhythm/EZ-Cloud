#!/usr/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-11
# Modified on: 2022-07-26 - To add --nopublish parameter and feature
# Modified on: 2022-08-05 - To add `--latest` parameter
# Description: Create the named volume and Start PostgreSQL container `oc-db`
# Parameters:
#  --help         Shows Help message
#  --nopublish    Skips publishing to Docker Hub
# =============================================

# Display Help message
if [[ "$*" == *--help* ]]; then
  echo ""
  echo "Usage:  _docker.build-oc-db.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "   --help                Shows this help"
  echo "   --nopublish           Skips publishing to Docker Hub"
  echo "   --latest              Tag the image as \`latest\` instead of \`latest-dev\`"
  echo ""
  exit 0
fi

LATEST_TAG=latest-dev
if [[ "$*" == *--latest* ]]; then
  LATEST_TAG=latest
fi

echo "### BUILD DOCKER IMAGE (FLAG: $LATEST_TAG)..."
docker build -t tonymasse/oc-db:v1.0 -t tonymasse/oc-db:$LATEST_TAG ./

echo "### Done."

if [[ "$*" == *--nopublish* ]]; then
  echo "### SKIPPING PUBLISHING, as per \`--nopublish\` parameter."
  echo "### Next steps for you are likely to be:"
  echo "docker login"
  echo "docker push --all-tags tonymasse/oc-db"
else
  echo "### PUBLISHING \`oc-db\` CONTAINER IMAGE..."
  docker push --all-tags tonymasse/oc-db

  echo "### 🟢🏁 PUBLISH PROCESS COMPLETE."
fi
