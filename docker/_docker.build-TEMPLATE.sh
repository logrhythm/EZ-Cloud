#!/usr/bin/env ash

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-25 (Template creation date)
# Modified on: 2022-08-05 - To add Help and `--latest` parameter
# Modified on: 2023-01-13 - To use `ash` instead of `bash`, so it can be run from inside the `oc-admin_dev` container
# Modified on: 2023-01-13 - To add Grype verification command
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

echo "### PULL LATEST NODE:18-ALPINE IMAGE..."
docker pull node:18-alpine

echo "### BUILD DOCKER IMAGE..."
#_DOCKER_COMMAND_GOES_HERE

echo "### SECURITY CHECK DOCKER IMAGE WITH GRYPE..."
#_GRYPE_COMMAND_GOES_HERE

echo "### Done."

echo "### Next step for you are likely to be:"
echo "docker login"
echo "docker push --all-tags tonymasse/oc-admin"
