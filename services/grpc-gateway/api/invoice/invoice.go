package invoice

import (
	"context"

	invoiceGen "github.com/agave/ah-microservices/services/grpc-gateway/api/invoice/generated"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"google.golang.org/grpc"
)

// RegisterHTTPEndpoint callback to register users http endpoint
func RegisterHTTPEndpoint(ctx context.Context, mux *runtime.ServeMux,
	endpoint string, opts []grpc.DialOption) (err error) {

	return invoiceGen.RegisterInvoiceHandlerFromEndpoint(
		ctx, mux, endpoint, opts)
}
