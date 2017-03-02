#!/bin/bash

./node_modules/.bin/sequelize db:migrate --config config/index.js
./node_modules/.bin/sequelize db:seed:all --config config/index.js

export NODE_ENV=test

./node_modules/.bin/sequelize db:migrate --config config/index.js
./node_modules/.bin/sequelize db:seed:all --config config/index.js

export NODE_ENV=development
