# =============================================
# Author:      Tony Massé
# Create date: 2022-07-25
# Modified on: 2022-10-13 - To `chmod +x` the Linux binary of `encryptionTool`
# Modified on: 2022-12-13 - To add JWT token generation
# Modified on: 2023-01-15 - To build config/ at run first time
# Modified on: 2023-02-23 - To use `node:18-alpine` as base image
# Modified on: 2023-04-28 - To use upgrade all installed packages
# Modified on: 2023-07-27 - To use upgrade all installed global NPM packages
# Description: Describes container `oc-admin`, based on NodeJS
#              This container is designed to run the OC Admin (formerly EZ Cloud) Backend
# =============================================

FROM node:18-alpine

RUN apk update
RUN apk upgrade
RUN apk add uuidgen
RUN npm update -g

WORKDIR /app

COPY . .

RUN chmod +x bin/encryptionTool
RUN rm -rf config/
RUN rm -f config.sample/database.json

EXPOSE 8400

CMD echo "### BRINGING CONFIGURATION..." \
    && mkdir -p config \
    && cp -n config.sample/* config/ \
    && echo "### CREATING UNIQUE IDENTIFIER FOR THIS DEPLOYMENT..." \
    && sed -i "s/CHANGE_ME_WITH_A_UUID/$(uuidgen)/" config/ez-market-place.json \
    && echo "### GENERATING PRIVATE AES ENCRYPTION KEY FOR THIS DEPLOYMENT..." \
    && sed -i "s/CHANGE_ME_WITH_A_SUPER_LONG_STRING_OF_RANDOM_CHARACTERS/$(uuidgen)-$(uuidgen)/" config/secure.json \
    && echo "### GENERATING JWT TOKEN FOR THIS DEPLOYMENT..." \
    && sed -i "s/CHANGE_ME_WITH_A_SUPER_LONG_STRING_OF_RANDOM_CHARACTERS/$(uuidgen)-$(uuidgen)/" config/jwt.json \
    && node bin/service.js
