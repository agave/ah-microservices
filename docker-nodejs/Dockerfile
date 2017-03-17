FROM node:6.9.5-alpine

RUN apk update && \
  apk add alpine-sdk libc6-compat bash netcat-openbsd postgresql-client && \
  npm set progress=false && \
  npm install -g --progress=false yarn nodemon

RUN mkdir /var/lib/app
COPY package.json /var/lib/app
WORKDIR /var/lib/app

RUN yarn install
