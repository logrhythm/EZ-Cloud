#!/usr/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-11
# Modified on: 2022-07-13 - To increase user watches, instances and queued events limits on the Docker host
# Description: Pull and Start Dev version of the OC-Admin container `oc-admin_dev`
# =============================================

# To be ran on the Docker host to start this container

echo "### INCREASING USER WATCHES LIMIT (SYSCTL)..."
echo "fs.inotify.max_user_watches=1048576" | sudo tee -a /etc/sysctl.conf

echo "### INCREASING USER INSTANCES LIMIT (SYSCTL)..."
echo "fs.inotify.max_user_instances=1048576" | sudo tee -a /etc/sysctl.conf

echo "### INCREASING QUEUED EVENTS LIMIT (SYSCTL)..."
echo "fs.inotify.max_queued_events=1048576" | sudo tee -a /etc/sysctl.conf

echo "### RELOADING SYSCTL CONFIGURATION..."
sudo sysctl -p

echo "### Create `oc-admin_dev` Volume..."
docker volume create oc-admin_dev

echo "### PULL CONTAINER..."
docker pull tonymasse/oc-admin_dev

echo "### RUN CONTAINER IN INTERACTIVE MODE..."
# docker run --interactive --tty --publish 8400:8400/tcp --network logrhythm --volume /var/run/docker.sock:/var/run/docker.sock --name oc-admin tonymasse/oc-admin_dev
docker run --interactive --tty --publish 8400:8400/tcp --network logrhythm --volume oc-admin_dev:/app/EZ-Cloud/dist --name oc-admin tonymasse/oc-admin_dev
