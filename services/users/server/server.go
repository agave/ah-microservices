package server

import (
	"fmt"
	"log"
	"net"

	xContext "golang.org/x/net/context"
	"google.golang.org/grpc"

	userGen "github.com/agave/ah-microservices/services/users/user/generated"
)

// UserServer implements user service functionality through grpc
type userServer struct{}

// GetUser looks for the Id param in the database and returns user details if found
func (s *userServer) GetUser(ctx xContext.Context, id *userGen.Id) (*userGen.Profile, error) {
	return nil, nil
}

// CreateUser creates a user in the database based on the Create param
func (s *userServer) CreateUser(ctx xContext.Context, c *userGen.Create) (*userGen.Profile, error) {
	return nil, nil
}

func StartServer() {
	lis, err := net.Listen("tcp", fmt.Sprintf(":80"))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()
	userGen.RegisterUserServer(grpcServer, &userServer{})
	// determine whether to use TLS
	grpcServer.Serve(lis)
}
