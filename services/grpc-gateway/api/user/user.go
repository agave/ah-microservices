package user

import (
	"context"

	userGen "github.com/agave/ah-microservices/services/grpc-gateway/api/user/generated"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"google.golang.org/grpc"
)

// RegisterHTTPEndpoint callback to register users http endpoint
func RegisterHTTPEndpoint(ctx context.Context, mux *runtime.ServeMux,
	endpoint string, opts []grpc.DialOption) (err error) {

	return userGen.RegisterUserHandlerFromEndpoint(
		ctx, mux, endpoint, opts)
}
