#!/bin/bash

set -ev

./scripts/lint-check.sh
./scripts/travis/run-tests.sh
#make e2e
#./scripts/travis/push-images.sh
