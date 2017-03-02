FROM agavelab/nodejs:latest

COPY ./invoices/src /var/lib/app
COPY ./core /var/lib/core
COPY ./invoices/scripts /home/docker/

WORKDIR /var/lib/app

RUN chmod +x /home/docker/*.sh && yarn install >/dev/null 2>&1

EXPOSE 80

ENTRYPOINT ["/home/docker/startup.sh"]
