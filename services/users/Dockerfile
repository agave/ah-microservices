FROM agavelab/golang-base:latest

WORKDIR /go/src/github.com/agave/ah-microservices/services/users

ADD users .
COPY core/protos protos
COPY core/database /home/database
COPY users/scripts /home/docker

RUN chmod +x /home/docker/*.sh \
    && make import_path=protos service_proto=user
RUN apk del --no-progress curl git

ENTRYPOINT ["/home/docker/startup.sh"]
