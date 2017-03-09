package server

import (
	"fmt"
	"net"

	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/db"
	"github.com/agave/ah-microservices/services/users/user"
	userGen "github.com/agave/ah-microservices/services/users/user/generated"
	xContext "golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
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
		return &userGen.Profile{},
			grpc.Errorf(codes.InvalidArgument, "Balance can't be negative")
	}

	user := user.Users{Email: c.GetEmail()}

	exists, err := db.Engine.Get(&user)
	if err != nil {
		return &userGen.Profile{},
			grpc.Errorf(codes.Internal, "%s", err.Error())
	}

	if exists {
		return &userGen.Profile{},
			grpc.Errorf(codes.AlreadyExists, "User already exists")
	}

	user.Balance = c.GetBalance()

	// create user in db
	affectedRows, err := db.Engine.InsertOne(&user)
	if err == nil && affectedRows == 1 {
		p := userGen.Profile(user)
		return &p, nil
	}

	return &userGen.Profile{},
		grpc.Errorf(codes.Unknown, "Unable to create user")
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
