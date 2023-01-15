#!/bin/sh

# =============================================
# Author:      Tony Massé
# Create date: 2023-01-04
# Description: Call Init then run the container.
# Parameters:
#  --help         Shows Help message
# =============================================

# To be ran on the Docker host to start this container

# Display Help message
if [[ "$*" == *help* ]]; then
  echo ""
  echo "Usage:  _entrypoint.run.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "   --help                Shows this help"
  echo ""
  echo "By default (no parameters) it will run for ever."
  echo ""
  exit 0
fi

echo "### Run \`Init\` entry point..."
/app/_entrypoint.init.sh

echo ""
echo "#########################################################"
echo "##                                                     ##"
echo "##                   CONTAINER READY                   ##"
echo "##                                                     ##"
echo "#########################################################"
echo "##              Connect with VS Code and:              ##"
echo "##                                                     ##"
echo "##            - open folder /app/EZ-Cloud              ##"
echo "##                                                     ##"
echo "##               - for EZ Backend, run:                ##"
echo "##                    npm run dev                      ##"
echo "##                                                     ##"
echo "##               - for EZ Frontend, run:               ##"
echo "##       cd frontend ; npm install ; quasar dev        ##"
echo "##                                                     ##"
echo "##           - for EZ Market Backend, run:             ##"
echo "##   cd ez-market-place ; npm install ; npm run dev    ##"
echo "##                                                     ##"
echo "##           - for EZ Market Frontend, run:            ##"
echo "## cd ez-market-place_admin ; npm install ; quasar dev ##"
echo "##                                                     ##"
echo "#########################################################"
echo "##                                                     ##"
echo "##         Use 'docker stop' or 'docker kill'          ##"
echo "##               to stop this container                ##"
echo "##                                                     ##"
echo "##                (SAVE AND GIT COMMIT                 ##"
echo "##                 YOUR WORK FIRST!!)                  ##"
echo "##                                                     ##"
echo "#########################################################"
echo ""
tail -f /dev/null
