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

VERSION_TAG=v1.2

LATEST_TAG=latest-dev
if [[ "$*" == *--latest* ]]; then
  LATEST_TAG=latest
fi

echo "### PULL LATEST POSTGRES:14-ALPINE IMAGE..."
docker pull postgres:14-alpine

echo "### BUILD DOCKER IMAGE (FLAG: $LATEST_TAG)..."
docker build -t tonymasse/oc-db:$VERSION_TAG -t tonymasse/oc-db:$LATEST_TAG ./

echo "### Done."

if [[ "$*" == *--nopublish* ]]; then
  echo "### SKIPPING PUBLISHING, as per \`--nopublish\` parameter."
  echo "### Next steps for you are likely to be:"
  echo "docker login"
  echo "docker push --all-tags tonymasse/oc-db"
else
  echo "### PUBLISHING \`oc-db\` CONTAINER IMAGE..."
  # docker push --all-tags tonymasse/oc-db
  docker push tonymasse/oc-db:$VERSION_TAG
  docker push tonymasse/oc-db:$LATEST_TAG

  echo "### 🟢🏁 PUBLISH PROCESS COMPLETE."
fi

echo "### RUN GRYPE ON DOCKER IMAGE (tonymasse/oc-db:$VERSION_TAG)..."
docker run --rm --volume /var/run/docker.sock:/var/run/docker.sock anchore/grype:latest "tonymasse/oc-db:$VERSION_TAG" --add-cpes-if-none