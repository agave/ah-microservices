FROM gypsydiver/golang-base:latest

WORKDIR /go/src/github.com/agave/ah-microservices/services/users

ADD users .
# COPY protos
COPY users/scripts /home/docker

RUN chmod +x /home/docker/*.sh \
    && make
RUN apk del --no-progress curl git make gcc g++

ENTRYPOINT ./users
