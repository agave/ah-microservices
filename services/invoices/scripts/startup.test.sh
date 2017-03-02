#!/bin/bash

set -e

until nc -z -v -w30 rabbitmq 5672
do
  echo "Waiting for rabbitmq to start..."
  sleep 5
done

until nc -z -v -w30 db 5432
do
  echo "Waiting for rabbitmq to start..."
  sleep 5
done

# shellcheck disable=SC1091
source /var/lib/core/database/postgres-create.sh

# shellcheck disable=SC1091
source /var/lib/core/database/sequelize-migrations.sh

make unit-test
make functional-test
