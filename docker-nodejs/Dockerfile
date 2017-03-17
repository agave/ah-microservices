FROM node:6.9.5

RUN apt-get update && \
    apt-get install -y postgresql-client netcat libssl-dev libsasl2-dev librdkafka-dev && \
    npm set progress=false && \
    npm install -g --progress=false yarn nodemon

RUN mkdir /var/lib/app
COPY package.json /var/lib/app/
WORKDIR /var/lib/app

RUN yarn global add torus-cli && \
    yarn install
