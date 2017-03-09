FROM agavelab/nodejs:latest

COPY ./invoices/src /var/lib/app
COPY ./core /var/lib/core
COPY ./invoices/scripts /home/docker/

WORKDIR /var/lib/app

RUN chmod -R +x /home/docker/*.sh /var/lib/app/node_modules/* && yarn install

EXPOSE 80

ENTRYPOINT ["/home/docker/startup.sh"]
