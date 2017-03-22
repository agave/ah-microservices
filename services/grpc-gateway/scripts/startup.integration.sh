#!/bin/bash

until nc -z -v -w30 apigateway 80
do
  echo "Waiting for apigateway service to start..."
  sleep 5
done

./grpc-gateway
