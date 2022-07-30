# =============================================
# Author:      Tony Massé
# Create date: 2022-07-05
# Modified on: 2022-07-25 - Add tools to allow Build for Docker
# Modified on: 2022-07-26 - Add option to do a full build for Docker
# Description: Describe container `oc-admin_dev`, based on NodeJS
#              This container is designed to develop, as opposed
#              to run, the OC Admin (formerly EZ Cloud) Backend,
#              Frontend and Market's Back and Front ends.
# Environment Variables:
#    BUILD_OC_ADMIN_IMAGE      If set to any value, will do a full Build for Docket and quit
# =============================================

FROM node:16-alpine

RUN apk update
RUN apk add git
RUN apk add uuidgen
RUN apk add zip

WORKDIR /app

COPY . .

# Moving this out of the of Docker and in the build Bash script
# RUN git clone https://github.com/logrhythm/EZ-Cloud.git

EXPOSE 8400

CMD cd "EZ-Cloud" \
    && echo "### SWITCHING TO THE CURRENT BRANCH..." \
    && git checkout v0.9 \
    && echo "### GETTING THE LATEST CHANGES FROM REPO..." \
    && git pull \
    && echo "### BRINGING IN ENVIRONMENT..." \
    && cp --no-clobber ../.env ./ \
    && echo "### COPYING TEMPLATE CONFIGURATION..." \
    && cp --no-clobber --recursive config.dist config \
    && echo "### CREATING UNIQUE IDENTIFIER FOR THIS DEPLOYMENT..." \
    && sed -i "s/CHANGE_ME_WITH_A_UUID/$(uuidgen)/" config/ez-market-place.json \
    && echo "### GENERATING PRIVATE AES ENCRYPTION KEY FOR THIS DEPLOYMENT..." \
    && sed -i "s/CHANGE_ME_WITH_A_SUPER_LONG_STRING_OF_RANDOM_CHARACTERS/$(uuidgen)-$(uuidgen)/" config/secure.json \
    && echo "### DOWNLOADING AND INSTALLING BACKEND NPM PACKAGES (this can take several minutes)..." \
    && npm config set fetch-retries 10 \
    && npm config set fetch-retry-mintimeout 120000 \
    && npm config set fetch-retry-maxtimeout 600000 \
    && npm install \
    && echo "### DOWNLOADING AND INSTALLING GLOBALLY QUASAR NPM PACKAGE..." \
    && npm install --location=global @quasar/cli \
    && echo "" \
    && echo "#########################################################" \
    && echo "##                                                     ##" \
    && echo "##                   CONTAINER READY                   ##" \
    && echo "##                                                     ##" \
    && echo "#########################################################" \
    && echo "##              Connect with VS Code and:              ##" \
    && echo "##                                                     ##" \
    && echo "##            - open folder /app/EZ-Cloud              ##" \
    && echo "##                                                     ##" \
    && echo "##               - for EZ Backend, run:                ##" \
    && echo "##                    npm run dev                      ##" \
    && echo "##                                                     ##" \
    && echo "##               - for EZ Frontend, run:               ##" \
    && echo "##       cd frontend ; npm install ; quasar dev        ##" \
    && echo "##                                                     ##" \
    && echo "##           - for EZ Market Backend, run:             ##" \
    && echo "##   cd ez-market-place ; npm install ; npm run dev    ##" \
    && echo "##                                                     ##" \
    && echo "##           - for EZ Market Frontend, run:            ##" \
    && echo "## cd ez-market-place_admin ; npm install ; quasar dev ##" \
    && echo "##                                                     ##" \
    && echo "#########################################################" \
    && echo "##                                                     ##" \
    && echo "##         Use 'docker stop' or 'docker kill'          ##" \
    && echo "##               to stop this container                ##" \
    && echo "##                                                     ##" \
    && echo "##                (SAVE AND GIT COMMIT                 ##" \
    && echo "##                 YOUR WORK FIRST!!)                  ##" \
    && echo "##                                                     ##" \
    && echo "#########################################################" \
    && echo "" \
    && [[ -z "${BUILD_OC_ADMIN_IMAGE}" ]] && tail -f /dev/null \
    || cd /app/EZ-Cloud && npm run buildDockerFull
