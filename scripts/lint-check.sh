#!/bin/bash

set -e

# shellcheck disable=SC2046
shellcheck $(find . -name '*.sh' -not -path "*node_modules*")

# shellcheck disable=SC2046
eslint --quiet $(find . -name '*.js' -not -path "*node_modules*" -not -path "*coverage*")
