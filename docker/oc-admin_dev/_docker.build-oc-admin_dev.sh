#!/usr/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-11
# Modified on: 2023-01-04 - Up container build version to v1.1
# Description: Build the Dev version of the OC-Admin container `oc-admin_dev`.
# Parameters:
#  --help         Shows Help message
#  --nopublish    Skips publishing to Docker Hub
# =============================================

# Display Help message
if [[ "$*" == *help* ]]; then
  echo ""
  echo "Usage:  _docker.build-oc-admin_dev.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "   --help                Shows this help"
  echo "   --nopublish           Skips publishing to Docker Hub"
  echo ""
  exit 0
fi

echo "### CHECKING GIT IS INSTALLED..."
if command -v "git" &> /dev/null; then
  echo "Git is present"
else
  echo "Git not installed. Please install it prior to running this script."
  echo "Run the following:"
  echo "yum -y install git"
  return 1
fi

echo "### CLONE GIT REPO..."
git clone https://github.com/logrhythm/EZ-Cloud.git

echo "### BUILD \`oc-admin_dev\` DOCKER IMAGE..."
docker build -t tonymasse/oc-admin_dev:v1.1 -t tonymasse/oc-admin_dev:latest ./

echo "### Done."

if [[ "$*" == *nopublish* ]]; then
  echo "### SKIPPING PUBLISHING, as per \`--nopublish\` parameter."
  echo "### Next step for you are likely to be:"
  echo "docker login"
  echo "docker push --all-tags tonymasse/oc-admin_dev"
else
  echo "### PUBLISHING \`oc-admin_dev\` CONTAINER IMAGE..."
  docker push --all-tags tonymasse/oc-admin_dev

  echo "### 🟢🏁 PUBLISH PROCESS COMPLETE."
fi
