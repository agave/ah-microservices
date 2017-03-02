#!/bin/bash

set -e

mkdir -p unit_coverage
echo "" > unit_coverage/lcov.info

for d in $(glide nv); do
    go test -coverprofile=profile.out -covermode=atomic "$d"
    if [ -f profile.out ]; then
        cat profile.out >> unit_coverage/lcov.info
        rm profile.out
    fi
done
