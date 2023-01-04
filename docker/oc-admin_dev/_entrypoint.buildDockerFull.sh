#!/bin/sh

# =============================================
# Author:      Tony Massé
# Create date: 2023-01-04
# Description: Builds the content of the `oc-admin` container. 
#              Run, build Frontend and Backend, then quit.
# Parameters:
#  --help         Shows Help message
# =============================================

# To be ran on the Docker host to start this container

# Display Help message
if [[ "$*" == *help* ]]; then
  echo ""
  echo "Usage:  __entrypoint.buildDockerFull.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "   --help                Shows this help"
  echo ""
  echo "By default (no parameters) it will run, build Frontend and Backend, then quit."
  echo ""
  exit 0
fi

echo "### Run \`Init\` entry point..."
/app/_entrypoint.init.sh

echo "### Run \`npm run buildDockerFull\`..."
npm run buildDockerFull
