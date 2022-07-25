#!/usr/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-25
# Description: Check Dev version of the OC-Admin container `oc-admin_dev`
#              is running, and use it to build the `oc-admin` container's 
#              content prior to call the Docker command to build the 
#              `oc-admin` container.
# Parameters:
#  --help         Shows Help message
#  --nopublish    Skips publishing to Docker Hub
# =============================================

# Display Help message
if [[ "$*" == *help* ]]; then
  echo ""
  echo "Usage:  _docker.build_oc-admin_production.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "   --help                Shows this help"
  echo "   --nopublish           Skips publishing to Docker Hub"
  echo ""
  exit 0
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
  else
    echo "###   \-> 🟢 ID FOUND: $containerId."

    echo "### CLEAN PREVIOUS ARTIFACTS (\`Dockerfile\` and \`_docker.build.sh\`)..."
    if [[ -f "/var/lib/docker/volumes/oc-admin_dev/_data/Dockerfile" ]]; then
      echo "###   \-> DELETING \`/var/lib/docker/volumes/oc-admin_dev/_data/Dockerfile\`)..."
      rm "/var/lib/docker/volumes/oc-admin_dev/_data/Dockerfile"
    fi
    if [[ -f "/var/lib/docker/volumes/oc-admin_dev/_data/_docker.build.sh" ]]; then
      echo "###   \-> DELETING \`/var/lib/docker/volumes/oc-admin_dev/_data/_docker.build.sh\`)..."
      rm "/var/lib/docker/volumes/oc-admin_dev/_data/_docker.build.sh"
    fi

    echo "### RUN BUILD COMMAND ON CONTAINER IN INTERACTIVE MODE..."
    docker exec -it $containerId ash -c 'cd EZ-Cloud && npm run buildDocker'

    echo "### CHECK FILES ARE READY TO BUILD CONTAINERISED..."
    if [[ -f "/var/lib/docker/volumes/oc-admin_dev/_data/Dockerfile" ]] && [[ -f "/var/lib/docker/volumes/oc-admin_dev/_data/_docker.build.sh" ]]; then
      echo "###   \-> 🟢 DOCKER FILES FOUND."

      echo "### BUILD \`oc-admin\` CONTAINER..."
      /usr/bin/env bash -c "cd /var/lib/docker/volumes/oc-admin_dev/_data/ && chmod +x _docker.build.sh && ./_docker.build.sh"

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

  fi
else
  echo "### 🔴 ERROR: \`oc-admin_dev\` CONTAINER MUST BE RUNNING. BUILD PROCESS CANCELLED"
  echo "### ℹ Please run the following commands prior to this one:"
  echo "docker volume create oc-admin_dev"
  echo "docker run --interactive --tty --network logrhythm --volume oc-admin_dev:/app/EZ-Cloud/dist tonymasse/oc-admin_dev"
fi

