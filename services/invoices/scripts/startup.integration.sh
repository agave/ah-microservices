#!/bin/bash

set -u

# shellcheck disable=SC1091
source /var/lib/core/database/postgres-create.sh

yarn install

# shellcheck disable=SC1091
source /var/lib/core/database/sequelize-migrations.sh

node integration_seeds/e2e.js

nodemon app.js
