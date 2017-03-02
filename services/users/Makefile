GOCMD 	= go
PKG 	= $(glide nv)
BIN   	= users

.PHONY: %

default: all

# all: proto lint clean-all test build
all: lint test clean-all build
build: deps
	$(GOCMD) build -a -o $(BIN) .
lint: fmt vet deps
	$(GOCMD) get -u github.com/alecthomas/gometalinter
	gometalinter --install
	gometalinter ./... --vendor --disable=gotype --deadline=1000s --exclude="pb.*"
	rm -rf $(GOPATH)/src/github.com/alecthomas/gometalinter
	rm -rf $(GOPATH)/bin/gometalinter
vet:
	$(GOCMD) vet $(PKG)
fmt:
	$(GOCMD) fmt $(PKG)
test: test-deps
	/home/docker/tests.sh
cover: test-deps
	$(GOCMD) test -cover $(PKG)
clean:
	$(GOCMD) clean -i $(PKG)
clean-all:
	$(GOCMD) clean -i -r $(PKG)
deps:
	glide up
test-deps: deps
	$(GOCMD) test -i $(PKG)
install:
	$(GOCMD) install
run: all
	./$(BIN)
protobuf:
	$(GOCMD) get -u github.com/golang/protobuf/proto
	$(GOCMD) get -u github.com/golang/protobuf/protoc-gen-go
	$(GOCMD) get -u github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway
	$(GOCMD) get -u github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger
proto: protobuf
	./scripts/proto-gen.sh $(api_endpoints_path)
regen: del proto
del:
	# TODO: implement
	# delete *.pb.*
	# delete *.swagger.*
