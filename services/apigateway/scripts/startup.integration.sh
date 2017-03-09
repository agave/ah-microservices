#!/bin/bash

until nc -z -v -w30 invoices 80
do
  echo "Waiting for invoices to start..."
  sleep 5
done

nodemon app.js
