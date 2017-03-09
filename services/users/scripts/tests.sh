#!/bin/bash

set -e

mkdir -p unit_coverage
echo "" > unit_coverage/lcov.info

mkdir -p functional_coverage
echo "" > functional_coverage/lcov.info

for d in $(glide nv --no-subdir); do
    go test -run /unit -coverprofile=profile.out -covermode=atomic "$d"
    if [ -f profile.out ]; then
        cat profile.out >> unit_coverage/lcov.info
        rm profile.out
    fi

    go test -run /functional -coverprofile=profile.out -covermode=atomic "$d"
    if [ -f profile.out ]; then
        cat profile.out >> functional_coverage/lcov.info
        rm profile.out
    fi
done
