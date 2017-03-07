#!/bin/bash

set -e

# shellcheck disable=SC1091
source /var/lib/core/database/postgres-create.sh

# shellcheck disable=SC1091
source /var/lib/core/database/sequelize-migrations.sh

make unit-test
make functional-test
