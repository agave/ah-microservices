#!/bin/bash

set -ex

# Create Database
# shellcheck disable=SC1091
source /home/database/postgres-create.sh

apk add -U --no-progress curl g++ gcc git make

# Run migrations
go get github.com/mattes/migrate

DB_URL=postgres://"$DB_USER":"$DB_PASSWORD"@"$DB_HOST":"$DB_PORT"?sslmode=disable

cd "$GOPATH/src/github.com/agave/ah-microservices/services/users" \
    && migrate -url "$DB_URL" -path ./migrations up

cd "$GOPATH/src/github.com/agave/ah-microservices/services/users" && make test

apk del --no-progress curl g++ gcc git make

cd "$GOPATH/src/github.com/agave/ah-microservices/services/users" \
    && migrate -url "$DB_URL" -path ./migrations down
