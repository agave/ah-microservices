package server

import (
	"context"

	userGen "github.com/agave/ah-microservices/services/users/user/generated"
)

// UserServer implements user service functionality through grpc
type UserServer struct{}

// GetUser looks for the Id param in the database and returns user details if found
func (s *UserServer) GetUser(ctx context.Context, id *userGen.Id) (*userGen.Profile, error) {
	return nil, nil
}

// CreateUser creates a user in the database based on the Create param
func (s *UserServer) CreateUser(ctx context.Context, c *userGen.Create) (*userGen.Profile, error) {
	return nil, nil
}
