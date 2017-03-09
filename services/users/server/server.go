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
	log.WithFields(log.Fields{
		"GUID": id.GetGuid(), "data": id.String(),
	}).Info("Received request")

	log.WithField("GUID", id.GetGuid()).Info("Searching for user in db")

	u := user.Users{ID: id.GetId()}
	h, err := db.Engine.Get(&u)
	if err != nil {
		log.WithField("GUID", id.GetGuid()).Info("Internal DB Error")
		return &userGen.Profile{}, grpc.Errorf(codes.Internal, "%s", err.Error())
	}

	if h {
		log.WithField("GUID", id.GetGuid()).Info("Found")
		p := userGen.Profile(u)
		return &p, nil
	}

	log.WithField("GUID", id.GetGuid()).Info("Not Found")
	return &userGen.Profile{}, grpc.Errorf(codes.NotFound, "Not Found")
}

// CreateUser creates a user in the database based on the Create param
func (s *userServer) CreateUser(ctx xContext.Context, c *userGen.Create) (*userGen.Profile, error) {
	//TODO: email format/security validation
	if c.GetEmail() == "" {
		return &userGen.Profile{},
			grpc.Errorf(codes.InvalidArgument, "Email can't be empty")
	}

	if c.Balance < 0 {
		return &userGen.Profile{},
			grpc.Errorf(codes.InvalidArgument, "Balance can't be negative")
	}

	user := user.Users{Email: c.GetEmail()}

	log.WithField("userEmail", user.Email).Info("Looking for user in db")
	exists, err := db.Engine.Get(&user)
	if err != nil {
		return &userGen.Profile{},
			grpc.Errorf(codes.Unknown, "Unable to create user")
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
