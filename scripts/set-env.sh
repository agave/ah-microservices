#!/bin/bash

OS=$(uname -a | cut -d ' ' -f 1)
interface="eth0"

if [ "$OS" == "Darwin" ]; then
  interface="en0"
fi

# shellcheck disable=SC2005
# shellcheck disable=SC2155
export DOCKER_HOST_IP="$(ifconfig $interface | grep "inet " | cut -d ' ' -f 2)"