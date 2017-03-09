#!/bin/bash

set -ex

# Create Database
# shellcheck disable=SC1091
source /home/database/postgres-create.sh

cd "$GOPATH/src/github.com/agave/ah-microservices/services/users" && make test
