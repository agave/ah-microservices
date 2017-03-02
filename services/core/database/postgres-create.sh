#!/bin/bash

devDB="$DB_NAME"_dev
testDB="$DB_NAME"_test

until nc -z -v -w30 db 5432
do
  echo "Waiting for db to start..."
  sleep 5
done

psql -v ON_ERROR_STOP=1 postgresql://"$DB_USER":"$DB_PASSWORD"@db <<-EOSQL
DO
\$do\$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_database WHERE datname = '$devDB') THEN
    RAISE NOTICE 'Databases already exists';
  ELSE
    PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE $devDB');
    PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE $testDB');

    GRANT ALL PRIVILEGES ON DATABASE "$devDB" TO $DB_USER;
    GRANT ALL PRIVILEGES ON DATABASE "$testDB" TO $DB_USER;
  END IF;
END
\$do\$;
EOSQL
