FROM agavelab/nodejs:latest

COPY ./apigateway/src /var/lib/app
COPY ./core /var/lib/core
COPY ./apigateway/scripts /home/docker/

WORKDIR /var/lib/app

RUN chmod +x /home/docker/*.sh && yarn install

EXPOSE 80

ENTRYPOINT ["/home/docker/startup.sh"]
