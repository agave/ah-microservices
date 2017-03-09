FROM node:6.9.5

RUN apt-get update && \
    apt-get install -y postgresql-client netcat libssl-dev libsasl2-dev librdkafka-dev && \
    npm set progress=false && \
    npm install -g --progress=false yarn nodemon

RUN mkdir /var/lib/app
WORKDIR /var/lib/app

COPY ./invoices/src /var/lib/app
COPY ./core /var/lib/core
COPY ./invoices/scripts /home/docker/

WORKDIR /var/lib/app

RUN chmod +x /home/docker/*.sh && yarn install

EXPOSE 80

ENTRYPOINT ["/home/docker/startup.sh"]
