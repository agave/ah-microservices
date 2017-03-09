FROM agavelab/nodejs:latest

COPY ./e2e-tests/src /var/lib/app
COPY ./services/core /var/lib/core
COPY ./e2e-tests/scripts/startup.sh /home/docker/

WORKDIR /var/lib/app

RUN chmod +x /home/docker/startup.sh && yarn install >/dev/null 2>&1

EXPOSE 80

ENTRYPOINT ["/home/docker/startup.sh"]
