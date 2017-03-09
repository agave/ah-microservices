#!/bin/bash

all_services=($(find services -maxdepth 1 -type d | awk -F'/' '{print $2}'))
echo "${all_services[@]}"
