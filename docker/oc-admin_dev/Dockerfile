# =============================================
# Author:      Tony Massé
# Create date: 2022-07-05
# Modified on: 2022-07-25 - Add tools to allow Build for Docker
# Modified on: 2022-07-26 - Add option to do a full build for Docker
# Modified on: 2022-12-02 - Change branch to v1.0, expose 8080 too
# Modified on: 2023-01-04 - Remove option to do a full build for Docker via Environment variable
# Modified on: 2023-01-04 - Break down Init, Run and Build into different entrypoint scripts
# Description: Describe container `oc-admin_dev`, based on NodeJS
#              This container is designed to develop, as opposed
#              to run, the OC Admin (formerly EZ Cloud) Backend,
#              Frontend and Market's Back and Front ends.
# =============================================

FROM node:16-alpine

RUN apk update
RUN apk add git
RUN apk add uuidgen
RUN apk add zip

WORKDIR /app

COPY . .

RUN chmod +x _entrypoint.init.sh
RUN chmod +x _entrypoint.run.sh
RUN chmod +x _entrypoint.buildDockerFull.sh

# Moving this out of the of Docker and in the build Bash script
# RUN git clone https://github.com/logrhythm/EZ-Cloud.git

EXPOSE 8400 8080

ENTRYPOINT ["/app/_entrypoint.run.sh"]
