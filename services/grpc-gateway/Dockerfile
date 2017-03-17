FROM agavelab/golang-base:latest

# Github personal access token to clone private repos
ARG pak

WORKDIR /go/src/github.com/agave/ah-microservices/services/grpc-gateway

ADD grpc-gateway .
COPY core/protos/api protos/api
COPY grpc-gateway/scripts /home/docker

RUN chmod +x /home/docker/*.sh \
    && make api_endpoints_path=protos/api
RUN apk del --no-progress curl

ENTRYPOINT ./src/grpc-gateway
