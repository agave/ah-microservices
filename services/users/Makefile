GOCMD 	= go
PKG 	= $(glide nv)
BIN   	= users

.PHONY: %

default: all

all: proto lint test clean-all build
build: deps
	$(GOCMD) build -a -o $(BIN) .
lint: fmt vet deps
	$(GOCMD) get -u gopkg.in/alecthomas/gometalinter.v1
	gometalinter.v1 --install
	gometalinter.v1 ./... \
		--vendor --disable=gotype \
		--deadline=1000s --exclude="pb.*" --debug
	rm -rf $(GOPATH)/src/gopkg.in/alecthomas/gometalinter.v1
	rm -rf $(GOPATH)/bin/gometalinter.v1
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
install-protobuf:
	$(GOCMD) get -u github.com/golang/protobuf/proto
	$(GOCMD) get -u github.com/golang/protobuf/protoc-gen-go
proto: install-protobuf
	/home/docker/proto-gen.sh $(import_path) $(service_proto)
regen: del proto
del:
	# TODO: implement
	# delete *.pb.*
	# delete *.swagger.*
