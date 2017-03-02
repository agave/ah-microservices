#!/bin/bash

set -x -u

# shellcheck disable=SC1091
source /var/lib/core/database/sequelize-migrations.sh

node app.js
