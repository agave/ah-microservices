#!/bin/bash

set -e

mkdir -p unit_coverage
echo "" > unit_coverage/lcov.info

go test -coverprofile=profile.out -covermode=atomic ./server
if [ -f profile.out ]; then
    cat profile.out >> unit_coverage//lcov.info
    rm profile.out
fi
