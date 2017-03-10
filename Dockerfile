FROM debian:jessie

WORKDIR /openlmis-stockmanagement-ui

COPY package.json .
COPY bower.json .
COPY config.json .
COPY src/ ./src/
