package server

import (
	"errors"
	"fmt"
	"net"

	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/db"
	"github.com/agave/ah-microservices/services/users/user"
	userGen "github.com/agave/ah-microservices/services/users/user/generated"
	xContext "golang.org/x/net/context"
	"google.golang.org/grpc"
)

// UserServer implements user service functionality through grpc
type userServer struct{}

// GetUser looks for the Id param in the database and returns user details if found
func (s *userServer) GetUser(ctx xContext.Context, id *userGen.Id) (*userGen.Profile, error) {
	return nil, nil
}

// CreateUser creates a user in the database based on the Create param
func (s *userServer) CreateUser(ctx xContext.Context, c *userGen.Create) (*userGen.Profile, error) {
	//TODO: email/security validation
	if c.Balance < 0 {
		// log
		return nil, errors.New("Balance must be greater or equal than/to zero")
	}

	user := user.Users{
		Email:   c.GetEmail(),
		Balance: c.GetBalance(),
	}

	// create user in db
	aff, err := db.Engine.Insert(&user)
	if err == nil && 1 == aff {
		n := userGen.Profile(user)
		return &n, nil
	}

	return &userGen.Profile{}, err
}

// StartServer configures and starts our Users grpc server
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
