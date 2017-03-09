#!/bin/bash

set -e

until nc -z -v -w30 grpc-gateway 80
do
  echo "Waiting for grpc-gateway service to start..."
  sleep 5
done

make test
