#!/bin/bash

set -x -e;

IMPORT_PATH=$1
SERVICE_PROTO=$2

protoc -I "$IMPORT_PATH" "$IMPORT_PATH/$SERVICE_PROTO.proto" \
	--go_out=plugins=grpc:"$GOPATH/src"
