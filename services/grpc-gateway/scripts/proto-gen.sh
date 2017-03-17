#!/bin/bash

set -e;

API_ENDPOINTS_PATH=$1

# Usage spliteroo list separator return-index
# ex. spliteroo a.a b.a c.a . 1
#   -> a b c
# ex. spliteroo a.a b.a c.a . 2
#   -> a a a
spliteroo() {
	echo "$1" | cut -d "$2" -f "$3"
}

generate_api_endpoints() {
	protoc -I"${GOPATH}/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis" \
		-I"$API_ENDPOINTS_PATH" \
		--go_out=Mgoogle/api/annotations.proto=github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis/google/api,plugins=grpc:"$GOPATH/src" \
		"$API_ENDPOINTS_PATH/$1.proto"
	mkdir -p "./api/$1/generated/"
	protoc -I"${GOPATH}/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis" \
		-I"$API_ENDPOINTS_PATH" \
		--grpc-gateway_out=logtostderr=true:"./api/$1/generated/" \
		"$API_ENDPOINTS_PATH/$1.proto"
	protoc -I"${GOPATH}/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis" \
		-I"$API_ENDPOINTS_PATH" \
		--swagger_out=logtostderr=true:"./api/swagger/" \
		"$API_ENDPOINTS_PATH/$1.proto"
}
mkdir -p "./api/swagger/"
# shellcheck disable=SC2010
for x in $(ls -1p "$API_ENDPOINTS_PATH" | grep -v '/$')
do
	generate_api_endpoints "$(spliteroo "$x" '.' 1)" "$OUT_PATH"
done
