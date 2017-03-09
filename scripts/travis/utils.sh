#!/bin/bash

# Utility function to check if an array contains a value
# Usage: contains "value" "${array[@]}"

utils::contains () {
  local e
  for e in "${@:2}"; do [[ "$e" == "$1" ]] && echo "y" && return 0; done
  echo "n"
  return 1
}
