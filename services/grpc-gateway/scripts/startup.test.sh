#!/bin/bash

set -x -u

cd "$GOPATH/src/github.com/agave/ah-microservices/services/grpc-gateway" && make test
