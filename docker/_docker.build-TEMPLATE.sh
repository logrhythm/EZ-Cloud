#!/usr/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-25 (Template creation date)
# Modified on: 2022-08-05 - To add Help and `--latest` parameter
# Description: Build `oc-admin` Docker container image
# =============================================

# Display Help message
if [[ "$*" == *--help* ]]; then
  echo ""
  echo "Usage:  _docker.build-oc-admin.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "   --help                Shows this help"
  echo "   --latest              Tag the image as \`latest\` instead of \`latest-dev\`"
  echo ""
  exit 0
fi

LATEST_TAG=latest-dev
if [[ "$*" == *--latest* ]]; then
  LATEST_TAG=latest
fi

echo "### BUILD DOCKER IMAGE..."
#_DOCKER_COMMAND_GOES_HERE

echo "### Done."

echo "### Next step for you are likely to be:"
echo "docker login"
echo "docker push --all-tags tonymasse/oc-admin"
