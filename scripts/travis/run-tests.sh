#!/bin/bash

set -e

# This script will build and test all modified services or all services if core is modified

# shellcheck source=scripts/travis/get-modified-services.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/get-modified-services.sh"
modified_services=( ${modified_services[@]} )
# shellcheck source=scripts/travis/get-all-services.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/get-all-services.sh"
all_services=( ${all_services[@]} )
# shellcheck source=scripts/travis/utils.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/utils.sh"

if [ ${#modified_services[@]} -eq 0 ]; then
  echo "No services changed so skipping tests"
  exit 0
fi

IS_INCLUDED="y"

# If core is changed all services must be rebuilt
if [ "$(utils::contains "core" "${modified_services[@]}")" == "$IS_INCLUDED" ]; then
  echo "Testing all services: " "${all_services[@]}"
  for service in "${all_services[@]}";
  do
    [ "$service" == "core" ] && continue
    echo "Testing: ${service}"
    if ! make test service="$service"
    then
      exit 1
    fi
  done
else
  echo "Testing modified services: " "${modified_services[@]}"
  for service in "${modified_services[@]}";
  do
    [ "$service" == "core" ] && continue
    echo "Testing: ${service}"
    if ! make test service="$service"
    then
      exit 1
    fi
  done
fi
