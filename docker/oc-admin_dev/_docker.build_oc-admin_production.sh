#!/usr/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-25
# Modified on: 2022-07-26 - To mix with _docker.run-oc-admin_dev.sh for temp image
# Description: Check Dev version of the OC-Admin container `oc-admin_dev`
#              is running, and use it to build the `oc-admin` container's 
#              content prior to call the Docker command to build the 
#              `oc-admin` container.
#              If no running `oc-admin_dev` is found, it spins a temporary
#              one, unless parameter `--notempimage` is present.
# Parameters:
#  --help         Shows Help message
#  --nopublish    Skips publishing to Docker Hub
#  --notempimage  Do not use temporary image if `oc-admin_dev` isn't already running
# =============================================

# Display Help message
if [[ "$*" == *--help* ]]; then
  echo ""
  echo "Usage:  _docker.build_oc-admin_production.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "   --help                Shows this help"
  echo "   --nopublish           Skips publishing to Docker Hub"
  echo "   --notempimage         Do not use temporary image if \`oc-admin_dev\` isn't already running"
  echo "   --latest              Tag the image as \`latest\` instead of \`latest-dev\`"
  echo ""
  echo "By default (no parameters) this script will attempt to use the currently running \`oc-admin_dev\`"
  echo "image, if none, it will spin a temporary one."
  echo ""
  exit 0
fi

LATEST_PARAM=""
if [[ "$*" == *--latest* ]]; then
  LATEST_PARAM="--latest"
fi

# Let's get cracking!
echo "### CHECK \`oc-admin_dev\` CONTAINER IS RUNNING..."
docker ps | grep "oc-admin_dev.*ago\s*Up" &> /dev/null && running=$? || running=$?
if [[ $running == 0 ]]; then
  echo "###   \-> 🟢 CONTAINER IS RUNNING."

  echo "### COLLECT RUNNING ID OF \`oc-admin_dev\` CONTAINER..."
  containerId=""
  containerId="$(docker ps | grep "oc-admin_dev.*ago\s*Up" | cut -c-12)"
  if [[ $containerId == "" ]]; then
    echo "### 🔴 ERROR: COULD NOT DETERMINATE THE RUNNING ID OF \`oc-admin_dev\` CONTAINER. BUILD PROCESS CANCELLED"
    exit 1
  fi
  echo "###   \-> 🟢 ID FOUND: $containerId."
else
  echo "###   \-> 🟠 CONTAINER IS NOT RUNNING."
  if [[ "$*" == *notempimage* ]]; then
    echo "### 🔴 ERROR: IF USING \`--notempimage\` PARAMETER, \`oc-admin_dev\` CONTAINER MUST BE RUNNING. BUILD PROCESS CANCELLED"
    echo "### ℹ Stop using the \`--notempimage\` parameter, or please run the following commands prior to this one:"
    echo "docker volume create oc-admin_dev"
    echo "docker run --interactive --tty --network logrhythm --volume oc-admin_dev:/app/EZ-Cloud/dist tonymasse/oc-admin_dev"
    exit 1
  fi
fi

# Carrying on
# At this stage, either oc-admin_dev is alreay running and we got its ID, or the user is allowing us to spin a temp oc-admin_dev

echo "### CLEAN PREVIOUS ARTIFACTS (\`Dockerfile\` and \`_docker.build-oc-admin.sh\`)..."
if [[ -f "/var/lib/docker/volumes/oc-admin_dev/_data/Dockerfile" ]]; then
  echo "###   \-> DELETING \`/var/lib/docker/volumes/oc-admin_dev/_data/Dockerfile\`)..."
  rm "/var/lib/docker/volumes/oc-admin_dev/_data/Dockerfile"
fi
if [[ -f "/var/lib/docker/volumes/oc-admin_dev/_data/_docker.build-oc-admin.sh" ]]; then
  echo "###   \-> DELETING \`/var/lib/docker/volumes/oc-admin_dev/_data/_docker.build-oc-admin.sh\`)..."
  rm "/var/lib/docker/volumes/oc-admin_dev/_data/_docker.build-oc-admin.sh"
fi

# Build the container content
#  - Build Frontend
#  - Import it in the Backend `public_html` directory
#  - Build Backent

if [[ "$*" == *notempimage* ]]; then
  echo "### RUN BUILD COMMAND ON CONTAINER IN INTERACTIVE MODE..."
  docker exec -it $containerId ash -c 'cd EZ-Cloud && npm run buildDockerFull'
else
  echo "### SPIN TEMPORARY \`oc-admin_dev\` IMAGE (./_docker.run-oc-admin_dev.sh --build_only)..."
  if [[ -f "_docker.run-oc-admin_dev.sh" ]]; then
    chmod +x _docker.run-oc-admin_dev.sh
    ./_docker.run-oc-admin_dev.sh --build_only
  else
    echo "### 🔴 ERROR: \`_docker.run-oc-admin_dev.sh\` SCRIPT IS NOT FOUND. BUILD PROCESS CANCELLED"
    exit 1
  fi
fi

# Double check the files are good, and Dockerise the life out of that thing!

echo "### CHECK FILES ARE READY TO BUILD CONTAINERISED..."
if [[ -f "/var/lib/docker/volumes/oc-admin_dev/_data/Dockerfile" ]] && [[ -f "/var/lib/docker/volumes/oc-admin_dev/_data/_docker.build-oc-admin.sh" ]]; then
  echo "###   \-> 🟢 DOCKER FILES FOUND."

  echo "### BUILD \`oc-admin\` CONTAINER..."
  /usr/bin/env bash -c "cd /var/lib/docker/volumes/oc-admin_dev/_data/ && chmod +x _docker.build-oc-admin.sh && ./_docker.build-oc-admin.sh $LATEST_PARAM"

  echo "### LISTING \`oc-admin\` CONTAINER IMAGES..."
  docker images tonymasse/oc-admin

  echo "### 🟢🏁 BUILD PROCESS COMPLETE."

  if [[ "$*" == *nopublish* ]]; then
    echo "### SKIPPING PUBLISHING, as per \`--nopublish\` parameter."
  else
    echo "### PUBLISHING \`oc-admin\` CONTAINER IMAGE..."
    docker push --all-tags tonymasse/oc-admin

    echo "### 🟢🏁 PUBLISH PROCESS COMPLETE."
  fi
else
  echo "### 🔴 ERROR: DOCKER FILES NOT FOUND IN \`/var/lib/docker/volumes/oc-admin_dev/_data/\`. BUILD PROCESS CANCELLED"
fi

# Extra brownie points for you, if you read all the comments up to here.