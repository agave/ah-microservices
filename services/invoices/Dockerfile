FROM agavelab/nodejs:latest

COPY ./invoices/src /var/lib/app
COPY ./core /var/lib/core
COPY ./invoices/scripts /home/docker/

WORKDIR /var/lib/app

ENV CFLAGS ""
ENV CPPFLAGS ""
ENV LDFLAGS ""

RUN chmod +x /home/docker/*.sh && yarn install

EXPOSE 80

ENTRYPOINT ["/home/docker/startup.sh"]
