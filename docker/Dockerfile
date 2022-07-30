# =============================================
# Author:      Tony Massé
# Create date: 2022-07-25
# Description: Describes container `oc-admin`, based on NodeJS
#              This container is designed to run the OC Admin (formerly EZ Cloud) Backend
# =============================================

FROM node:16-alpine

RUN apk update
RUN apk add uuidgen

WORKDIR /app

COPY . .

EXPOSE 8400

CMD echo "### CREATING UNIQUE IDENTIFIER FOR THIS DEPLOYMENT..." \
    && sed -i "s/CHANGE_ME_WITH_A_UUID/$(uuidgen)/" config/ez-market-place.json \
    && echo "### GENERATING PRIVATE AES ENCRYPTION KEY FOR THIS DEPLOYMENT..." \
    && sed -i "s/CHANGE_ME_WITH_A_SUPER_LONG_STRING_OF_RANDOM_CHARACTERS/$(uuidgen)-$(uuidgen)/" config/secure.json \
    && node bin/service.js
