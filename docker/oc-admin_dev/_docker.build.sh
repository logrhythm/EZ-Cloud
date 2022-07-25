#!/usr/bin/env bash

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

echo "### BUILD DOCKER IMAGE..."
docker build -t tonymasse/oc-admin_dev:v0.9.1 -t tonymasse/oc-admin_dev:latest ./

echo "### Done."

echo "### Next step for you are likely to be:"
echo "docker login"
echo "docker push --all-tags tonymasse/oc-admin_dev"
