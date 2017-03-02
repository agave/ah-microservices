#!/bin/bash

set -x -u

apk add -U --no-progress curl g++ gcc git make

cd "$GOPATH/src/github.com/agave/ah-microservices/services/users" && make test

apk del --no-progress curl g++ gcc git make
