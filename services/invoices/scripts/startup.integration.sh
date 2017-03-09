#!/bin/bash

set -u

# shellcheck disable=SC1091
source /var/lib/core/database/postgres-create.sh

yarn install

# shellcheck disable=SC1091
source /var/lib/core/database/sequelize-migrations.sh

node integration_seeds/e2e.js

until nc -z -v -w30 kafka 9092
do
  echo "Waiting for kafka to start..."
  sleep 5
done

nodemon app.js
