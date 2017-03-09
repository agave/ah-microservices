FROM agavelab/nodejs:latest

COPY ./invoices/src /var/lib/app
COPY ./core /var/lib/core
COPY ./invoices/scripts /home/docker/

WORKDIR /var/lib/app

RUN rm -rf /var/lib/app/node_modules/node-rdkafka
RUN chmod +x /home/docker/*.sh && yarn install

EXPOSE 80

ENTRYPOINT ["/home/docker/startup.sh"]
