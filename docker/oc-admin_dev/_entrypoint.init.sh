#!/bin/sh

# =============================================
# Author:      Tony Massé
# Create date: 2023-01-04
# Modified on: 2023-02-23 - Stop switching to `main` branch on start
# Description: Initialise the container.
# Parameters:
#  --help         Shows Help message
# =============================================

# To be ran on the Docker host to start this container

# Display Help message
if [[ "$*" == *help* ]]; then
  echo ""
  echo "Usage:  _entrypoint.init.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "   --help                Shows this help"
  echo ""
  echo "By default (no parameters) it will initialise the container and quit."
  echo ""
  exit 0
fi

echo "### Jump into \`/app/EZ-Cloud\` directory..."
cd /app/EZ-Cloud

# echo "### SWITCHING TO THE CURRENT BRANCH..."
# git checkout main

echo "### GETTING THE LATEST CHANGES FROM REPO..."
git pull

echo "### BRINGING IN ENVIRONMENT..."
cp --no-clobber .env.dev .env

echo "### COPYING TEMPLATE CONFIGURATION..."
cp --no-clobber --recursive config.dist config

echo "### CREATING UNIQUE IDENTIFIER FOR THIS DEPLOYMENT..."
sed -i "s/CHANGE_ME_WITH_A_UUID/$(uuidgen)/" config/ez-market-place.json

echo "### GENERATING PRIVATE AES ENCRYPTION KEY FOR THIS DEPLOYMENT..."
sed -i "s/CHANGE_ME_WITH_A_SUPER_LONG_STRING_OF_RANDOM_CHARACTERS/$(uuidgen)-$(uuidgen)/" config/secure.json

echo "### DOWNLOADING AND INSTALLING BACKEND NPM PACKAGES (this can take several minutes)..."
npm config set fetch-retries 10
npm config set fetch-retry-mintimeout 120000
npm config set fetch-retry-maxtimeout 600000
npm install

echo "### DOWNLOADING AND INSTALLING GLOBALLY QUASAR NPM PACKAGE..."
npm install --location=global @quasar/cli

echo "### SETTING NODE OPTIONS FOR OPENSSL..."
export NODE_OPTIONS=--openssl-legacy-provider
