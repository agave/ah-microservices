#!/bin/bash

set -u

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

yarn install

# shellcheck disable=SC1091
source /var/lib/core/database/sequelize-migrations.sh

node integration_seeds/e2e.js

nodemon app.js
