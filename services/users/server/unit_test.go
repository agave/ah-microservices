package server

import (
	"context"
	"fmt"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"

	"github.com/agave/ah-microservices/services/users/db"
	userGen "github.com/agave/ah-microservices/services/users/user/generated"
	"github.com/go-xorm/xorm"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type ServerMockEngine struct {
	xorm.Engine
	GetTimesCalled       int
	InsertOneTimesCalled int
	DeleteTimesCalled    int
	FeatureFlag          bool
}

func (s *ServerMockEngine) Get(bean interface{}) (bool, error) {
	defer func() {
		s.GetTimesCalled++
	}()
	switch s.GetTimesCalled {
	case 0:
		return false, fmt.Errorf("")
	case 1:
		return true, nil
	}
	return false, nil
}

func (s *ServerMockEngine) InsertOne(bean interface{}) (int64, error) {
	defer func() {
		s.InsertOneTimesCalled++
	}()
	return int64(1), nil
}

type MockUserUpdater struct {
	UpdateTimesCalled int
}

func (s *MockUserUpdater) Update(id int64, cols []string,
	bean interface{}) (int64, error) {
	defer func() {
		s.UpdateTimesCalled++
	}()
	switch s.UpdateTimesCalled {
	case 0:
		return 0, fmt.Errorf("")
	}
	return 1, nil
}

type ServerUnitSuite struct {
	suite.Suite
	A  *assert.Assertions
	DB *ServerMockEngine
	Up *MockUserUpdater
}

func (s *ServerUnitSuite) SetupSuite() {
	s.A = assert.New(s.T())
	s.DB = &ServerMockEngine{}
	db.Engine = s.DB
	s.Up = &MockUserUpdater{}
	userUpdater = s.Up
}

func (s *ServerUnitSuite) SetupTest() {
	s.DB.GetTimesCalled = 0
}

func (s *ServerUnitSuite) TestCreateUser() {
	// empty email
	c := &userGen.Create{}
	p, err := grpcClient.CreateUser(context.TODO(), c)
	s.A.Nil(p)
	s.A.Equal(codes.InvalidArgument, grpc.Code(err))

	// negative balance
	c = &userGen.Create{Email: "notempty@domain.com", Balance: -42}
	p, err = grpcClient.CreateUser(context.TODO(), c)
	s.A.Nil(p)
	s.A.Equal(codes.InvalidArgument, grpc.Code(err))

	//db error on lookup
	c = &userGen.Create{Email: "notempty@domain.com", Balance: 42}
	p, err = grpcClient.CreateUser(context.TODO(), c)
	s.A.Nil(p)
	s.A.Equal(codes.Unknown, grpc.Code(err))

	//already exists
	c = &userGen.Create{Email: "notempty@domain.com", Balance: 42}
	p, err = grpcClient.CreateUser(context.TODO(), c)
	s.A.Nil(p)
	s.A.Equal(codes.AlreadyExists, grpc.Code(err))

	//success
	c = &userGen.Create{Email: "notempty@domain.com", Balance: 42}
	p, err = grpcClient.CreateUser(context.TODO(), c)
	s.A.Equal(s.DB.InsertOneTimesCalled, 1)
	s.A.NotNil(p)
	s.A.Equal(codes.OK, grpc.Code(err))
}

func (s *ServerUnitSuite) TestGetUser() {
	//parse Error
	id := &userGen.Id{Guid: "aguid", Id: "dfgdsfsdfg"}
	u, err := grpcClient.GetUser(context.TODO(), id)
	s.A.Nil(u)
	s.A.Equal(codes.NotFound, grpc.Code(err))

	//db error
	id = &userGen.Id{Guid: "aguid", Id: "1"}
	u, err = grpcClient.GetUser(context.TODO(), id)
	s.A.Nil(u)
	s.A.Equal(codes.Internal, grpc.Code(err))

	//success
	id = &userGen.Id{Guid: "aguid", Id: "1"}
	u, err = grpcClient.GetUser(context.TODO(), id)
	s.A.NotNil(u)
	s.A.Equal(codes.OK, grpc.Code(err))
}

func (s *ServerUnitSuite) TestVerifyUser() {
	//parse Error
	v := &userGen.Verify{Guid: "aguid", Id: "dfgdsfsdfg", Amount: 0.0}
	u, err := grpcClient.VerifyUser(context.TODO(), v)
	s.A.False(u.GetCanUserFund())
	s.A.Equal(codes.NotFound, grpc.Code(err))

	//db error
	v = &userGen.Verify{Guid: "aguid", Id: "1", Amount: 0.0}
	u, err = grpcClient.VerifyUser(context.TODO(), v)
	s.A.False(u.GetCanUserFund())
	s.A.Equal(codes.Unknown, grpc.Code(err))

	//success
	v = &userGen.Verify{Guid: "aguid", Id: "1", Amount: 0.0}
	u, err = grpcClient.VerifyUser(context.TODO(), v)
	s.A.True(u.GetCanUserFund())
	s.A.Equal(codes.OK, grpc.Code(err))
}

func (s *ServerUnitSuite) TestUpdateUser() {
	//parse Error
	update := &userGen.UpdateUserParams{
		Guid: "aguid",
		Id:   "fkgjbdfg",
	}
	u, err := grpcClient.UpdateUser(context.TODO(), update)
	s.A.Nil(u)
	s.A.Equal(codes.NotFound, grpc.Code(err))

	//user unchanged
	update = &userGen.UpdateUserParams{
		Guid: "aguid",
		Id:   "1",
	}
	u, err = grpcClient.UpdateUser(context.TODO(), update)
	s.A.Nil(u)
	s.A.Equal(codes.Canceled, grpc.Code(err))

	//db update error
	update = &userGen.UpdateUserParams{
		Guid:  "aguid",
		Id:    "1",
		Email: "notempty@domain.org",
	}
	u, err = grpcClient.UpdateUser(context.TODO(), update)
	s.A.Nil(u)
	s.A.Equal(codes.Unknown, grpc.Code(err))
	s.A.Equal(1, s.Up.UpdateTimesCalled)

	update = &userGen.UpdateUserParams{
		Guid:  "aguid",
		Id:    "1",
		Email: "notempty@domain.org",
	}
	u, err = grpcClient.UpdateUser(context.TODO(), update)
	s.A.NotNil(u)
	s.A.Equal(codes.OK, grpc.Code(err))
}

func (s *ServerUnitSuite) TestDetermineChanges() {
	update := &userGen.UpdateUserParams{
		Email:         "notempty@domain.org",
		ChangeBalance: true,
	}

	c := determineChanges(update)
	s.A.Contains(c, "email")
	s.A.Contains(c, "balance")

	update = &userGen.UpdateUserParams{
		Email:         "notempty@domain.org",
		ChangeBalance: false,
	}

	c = determineChanges(update)
	s.A.Contains(c, "email")
	s.A.NotContains(c, "balance")

	update = &userGen.UpdateUserParams{
		Email:         "",
		ChangeBalance: true,
	}
	c = determineChanges(update)
	s.A.NotContains(c, "email")
	s.A.Contains(c, "balance")

	update = &userGen.UpdateUserParams{
		Email:         "",
		ChangeBalance: false,
	}
	c = determineChanges(update)
	s.A.NotContains(c, "email")
	s.A.NotContains(c, "balance")
}
