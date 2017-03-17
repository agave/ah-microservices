package server

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/agave/ah-microservices/services/grpc-gateway/util"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"google.golang.org/grpc"
)

type httpServerOptions struct {
	ctx     context.Context
	address string
	opts    []grpc.DialOption
}

// Serve starts grpc and http servers
func Serve() error {
	return http.ListenAndServe(fmt.Sprintf(":%d", util.Config.Port),
		createHTTPServer())
}

func createHTTPServer() *http.ServeMux {
	return addGWServerToHTTPServer(http.NewServeMux(), createGWServer())
}

func createGWServer() *runtime.ServeMux {
	return registerHTTPEndpoints(runtime.NewServeMux())
}

func registerHTTPEndpoints(gwServer *runtime.ServeMux) *runtime.ServeMux {
	config := createHTTPServerConfig()
	for _, callback := range registeredHTTPEndpoints {
		registerHTTP(config, callback, gwServer)
	}
	return gwServer
}

func createHTTPServerConfig() *httpServerOptions {
	return &httpServerOptions{
		ctx:     context.Background(),
		address: fmt.Sprintf("%s:%d", util.Config.AGHost, util.Config.AGPort),
		opts:    []grpc.DialOption{grpc.WithInsecure()},
	}
}

func registerHTTP(config *httpServerOptions, callback registerHTTPEndpoint,
	gwServer *runtime.ServeMux) {

	if err := callback(config.ctx, gwServer,
		config.address, config.opts); err != nil {
		// TODO: Log message and continue or finish
	}
}

func addGWServerToHTTPServer(httpServer *http.ServeMux,
	gwServer http.Handler) *http.ServeMux {

	httpServer.Handle("/", gwServer)
	return serveSwagger(httpServer)
}

func serveSwagger(httpServer *http.ServeMux) *http.ServeMux {
	swaggerDir := util.Config.SwaggerPath
	if files, err := ioutil.ReadDir(swaggerDir); err != nil {
		// TODO: log error and continue or finish
	} else {
		for _, file := range files {
			addSwaggerEndpoint(httpServer, file, swaggerDir)
		}
	}
	return httpServer
}

func addSwaggerEndpoint(httpServer *http.ServeMux,
	file os.FileInfo, swaggerDir string) {

	data, err := ioutil.ReadFile(swaggerDir + file.Name())
	if err != nil {
		// TODO: log error and continue or finish
	}
	registerSwaggerEndpoint(httpServer, file, data)
}

func registerSwaggerEndpoint(httpServer *http.ServeMux,
	file os.FileInfo, data []byte) {

	endpoint := "/docs/" + strings.TrimSuffix(file.Name(), ".swagger.json")
	httpServer.HandleFunc(endpoint, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if _, err := io.Copy(w, strings.NewReader(string(data))); err != nil {
			// TODO: Log error
			w.WriteHeader(http.StatusServiceUnavailable)
		}
	})
}
