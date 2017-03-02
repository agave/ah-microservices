FROM agavelab/golang-base:latest

WORKDIR /go/src/github.com/agave/ah-microservices/services/users

ADD users .
# COPY protos
COPY users/scripts /home/docker

RUN curl https://glide.sh/get | sh \
    && chmod +x /home/docker/*.sh \
    && make api_endpoints_path=protos/api
RUN apk del --no-progress curl g++ gcc git make

ENTRYPOINT ./users
