#!/bin/bash

set -e

# shellcheck disable=SC1091
source /var/lib/core/database/postgres-create.sh

# shellcheck disable=SC1091
source /var/lib/core/database/sequelize-migrations.sh

until nc -z -v -w30 kafka 9092
do
  echo "Waiting for kafka to start..."
  sleep 5
done

make unit-test
make functional-test
