#!/bin/bash

set -x -u -e

until nc -z -v -w30 apigateway 80
do
  echo "Waiting for apigateway service to start..."
  sleep 5
done

cd "$GOPATH/src/github.com/agave/ah-microservices/services/grpc-gateway" && make test
