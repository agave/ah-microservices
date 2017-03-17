package server

import (
	"context"

	"github.com/agave/ah-microservices/services/grpc-gateway/api/invoice"
	"github.com/agave/ah-microservices/services/grpc-gateway/api/user"

	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"google.golang.org/grpc"
)

type registerHTTPEndpoint func(ctx context.Context, mux *runtime.ServeMux,
	endpoint string, opts []grpc.DialOption) (err error)

var registeredHTTPEndpoints = []registerHTTPEndpoint{
	user.RegisterHTTPEndpoint,
	invoice.RegisterHTTPEndpoint,
}
