#!/bin/bash
apk add -U git

go get github.com/codegangsta/gin
cd 	src || exit
gin -a 8000 -b grpc-gateway r
# gin -h
