# =============================================
# Author:      Tony Massé
# Create date: 2022-07-11
# Description: Describe container `oc-db`, based on PostgreSQL
# =============================================

FROM postgres:14-alpine

RUN apk update
RUN apk add uuidgen

WORKDIR /

COPY . .
