#!/bin/bash

set -e

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

IS_INCLUDED="y"

# If core is changed all services must be rebuilt
if [ "$(utils::contains "core" "${modified_services[@]}")" == "$IS_INCLUDED" ]; then
  for service in "${all_services[@]}";
  do
    [ "$service" == "core" ] && continue
    echo "Building $service"
    if ! make build service="$service"
    then
      exit 1
    fi
  done
else
  for service in "${all_services[@]}";
  do
    [ "$service" == "core" ] && continue
    if [ "$(utils::contains "$service" "${modified_services[@]}")" == "$IS_INCLUDED" ]; then
      echo "Building $service"
      if ! make build service="$service"
      then
        exit 1
      fi
    else
      echo "Pulling $service"
      if ! docker pull agavelab/ah-microservices-"$service"
      then
        exit 1
      fi
    fi
  done
fi
