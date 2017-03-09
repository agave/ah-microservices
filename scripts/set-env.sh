#!/bin/bash

OS=$(uname -a | cut -d ' ' -f 1)

if [ "$OS" == "Darwin" ]; then
  # shellcheck disable=SC2005
  # shellcheck disable=SC2155
  export DOCKER_HOST_IP="$(ifconfig en0 | grep "inet " | cut -d ' ' -f 2)"
else
  # shellcheck disable=SC2005
  # shellcheck disable=SC2155
  export DOCKER_HOST_IP="$(ifconfig eth0 | grep "inet addr" | cut -d ':' -f 2 | cut -d ' ' -f 1)"
fi
