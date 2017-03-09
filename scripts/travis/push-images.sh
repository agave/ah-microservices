#!/bin/bash

set -e

# This push the images of modified services or all services if core is modified

if [ "$TRAVIS_BRANCH" != "master" ] || [ "$TRAVIS_EVENT_TYPE" == "pull_request" ]; then
  echo "Skipping push images step"
  exit 0
fi

echo "Pushing images on ${TRAVIS_BRANCH} ${TRAVIS_EVENT_TYPE}"

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

push-image () {
  docker tag agavelab/backendbase-"$1" agavelab/backendbase-"$1":"${TRAVIS_BUILD_ID}"
  docker tag agavelab/backendbase-"$1" agavelab/backendbase-"$1":latest
  docker push agavelab/backendbase-"$1":"${TRAVIS_BUILD_ID}"
  docker push agavelab/backendbase-"$1":latest
}

IS_INCLUDED="y"

# If core is changed all services must be rebuilt
if [ "$(utils::contains "core" "${modified_services[@]}")" == "$IS_INCLUDED" ]; then
  echo "Pushing all services:" "${all_services[@]}"
  for service in "${all_services[@]}";
  do
    [ "$service" == "core" ] && continue
    if ! push-image "$service"
    then
      exit 1
    fi
  done
else
  echo "Pushing modified services: " "${modified_services[@]}"
  for service in "${modified_services[@]}";
  do
    [ "$service" == "core" ] && continue
    if ! push-image "$service"
    then
      exit 1
    fi
  done
fi
