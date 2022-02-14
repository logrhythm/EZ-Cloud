#!/usr/bin/env bash

# #########################
# Startup script for the API service for the EZ Cloud Market Place
# #####
# Determine first if a local copy of NodeJS is present.
# - If yes, use it
# - If not, try to use a system-wide, or fail with an error message if node isn't in PATH
# #####

readonly EZ_API_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")"/../ && pwd)

# Handle script closure nicely, and terminate the EZ API service with it
trap 'kill $(jobs -p) >/dev/null 2>/dev/null' EXIT HUP QUIT PIPE

# Check for local copy of Node
if [ -f "$EZ_API_ROOT/bin/node/bin/node" ];
then

cd "$EZ_API_ROOT/"

# Use the bundled NodeJS  to start the EZ API service
"$EZ_API_ROOT/bin/node/bin/node" "$EZ_API_ROOT/src/index.js" "$@"

else

cd "$EZ_API_ROOT/"

# Use the system-wide NodeJS (if any) to start the EZ API service
node --version >/dev/null 2>/dev/null || echo -e "CRITICAL: NodeJS not present. Exiting." ; exit 42;
node "$EZ_API_ROOT/src/index.js" "$@"

fi
