#!/bin/bash

until nc -z -v -w30 invoices 80
do
  echo "Waiting for invoices to start..."
  sleep 5
done

until nc -z -v -w30 users 80
do
  echo "Waiting for users to start..."
  sleep 5
done

nodemon app.js
