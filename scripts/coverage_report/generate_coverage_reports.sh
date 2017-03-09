#!/bin/bash

npm install scripts/coverage_report --silent > /dev/null && node scripts/coverage_report/index.js

curl -s https://codecov.io/bash > codecov.sh
chmod +x codecov.sh

./codecov.sh -p coverage/unit/ -f "*.info" -F unit

./codecov.sh -p coverage/functional/ -f "*.info" -F functional

rm codecov.sh