package server

import (
	"context"
	"fmt"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"

	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/db"
	"github.com/agave/ah-microservices/services/users/user"
	userGen "github.com/agave/ah-microservices/services/users/user/generated"
	"github.com/agave/ah-microservices/services/users/util"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type ServerFunctionalSuite struct {
	suite.Suite
	A *assert.Assertions
}

func (s *ServerFunctionalSuite) SetupSuite() {
	var err error
	s.A = assert.New(s.T())

	// db
	util.Config.DB.DBName = util.Config.DB.DBName + "_test"

	url := util.FormatDBURL("postgres", &util.Config.DB)
	err = db.InitDB("postgres", url)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err, "url": url,
		}).Fatalln("Error starting database")
		return
	}

	err = db.Engine.CreateTables(&user.Users{})
	if err != nil {
		log.WithField("error", err).Fatalln("Error creating tables")
	}
}

func (s *ServerFunctionalSuite) TearDownSuite() {
	if ok, _ := db.Engine.IsTableExist(&user.Users{}); ok {
		db.Engine.DropTables(&user.Users{})
	}
	if ok, _ := db.Engine.IsTableExist(&user.HeldBalance{}); ok {
		db.Engine.DropTables(&user.HeldBalance{})
	}
	db.Engine.Close()
}

func (s *ServerFunctionalSuite) TestGetUser() {
	db.Engine.CreateTables(user.Users{})
	type testCases struct {
		Ins  []*userGen.Id
		Outs []codes.Code
	}

	h := &userGen.Create{Email: "admin@admin.com", Balance: 0}
	p, _ := grpcClient.CreateUser(context.TODO(), h)

	tc := testCases{
		Ins: []*userGen.Id{
			&userGen.Id{Guid: "1", Id: p.GetId()}, // happy
			&userGen.Id{Guid: "2", Id: "10000"},   // not found
			&userGen.Id{Guid: "3", Id: "-99999"},
		},
		Outs: []codes.Code{
			codes.OK,
			codes.NotFound,
			codes.NotFound,
		},
	}

	for i, v := range tc.Ins {
		p, err := grpcClient.GetUser(context.TODO(), v)
		s.A.Equal(tc.Outs[i], grpc.Code(err), "GetUser should return expected error")
		if tc.Outs[i] == codes.OK {
			s.A.Equal(v.GetId(), p.GetId(), "Should return same id")
			s.A.NotEmpty(p.GetEmail(), "Email shouldn't be empty")
		}
	}

	//trigger db error
	db.Engine.DropTables(&user.Users{})
	p, err := grpcClient.GetUser(context.TODO(), &userGen.Id{Id: "1"})
	s.A.Nil(p)
	s.A.Equal(codes.Internal, grpc.Code(err))
}

func (s *ServerFunctionalSuite) TestCreateUser() {
	db.Engine.CreateTables(user.Users{})
	type testCases struct {
		Ins  []*userGen.Create
		Outs []codes.Code
	}

	tc := testCases{
		Ins: []*userGen.Create{
			&userGen.Create{Email: "admin@admin.com", Balance: 0},
			&userGen.Create{Email: "admin@admin.com", Balance: 0},
			&userGen.Create{Email: "admin2@admin.com", Balance: -42},
			&userGen.Create{Email: "admin3@admin.com", Balance: 42},
			&userGen.Create{Email: "admin4@admin.com", Balance: 3456.3453},
			&userGen.Create{Email: "", Balance: 3456.3453},
		},
		Outs: []codes.Code{
			codes.OK,
			codes.AlreadyExists,
			codes.InvalidArgument,
			codes.OK,
			codes.OK,
			codes.InvalidArgument,
		},
	}

	for i, c := range tc.Ins {
		p, err := grpcClient.CreateUser(context.TODO(), c)
		s.A.Equal(tc.Outs[i], grpc.Code(err), "Create should return expected error")
		if tc.Outs[i] == codes.OK {
			s.A.NotNil(p)
			s.A.Equal(c.GetEmail(), p.GetEmail(), "Insert should return same Email")
			s.A.Equal(c.GetBalance(), p.GetBalance(), "Insert should return same Balance")
		}
	}

	//trigger db error
	db.Engine.DropTables(&user.Users{})
	crt := &userGen.Create{
		Email:   "not empty",
		Balance: 100.00,
	}
	p, err := grpcClient.CreateUser(context.TODO(), crt)
	s.A.Nil(p)
	s.A.Equal(codes.Unknown, grpc.Code(err))
}

func (s *ServerFunctionalSuite) TestUpdateUser() {
	db.Engine.CreateTables(user.Users{})
	//insert fixtures
	createFixture := &userGen.Create{
		Email:   "user@domain.org",
		Balance: 10.00,
	}
	u, err := grpcClient.CreateUser(context.TODO(), createFixture)
	s.A.Nil(err)
	s.A.Equal(createFixture.GetEmail(), u.GetEmail(), "Should return inserted fixture's email")
	s.A.Equal(createFixture.GetBalance(), u.GetBalance(), "Should return inserted fixture's balance")
	s.A.NotEmpty(u.GetId(), "Should return with a valid Id")

	//change email
	updateParams := &userGen.UpdateUserParams{
		Id:            u.GetId(),
		Email:         "user@domain.com",
		Balance:       0.0,
		ChangeBalance: false,
	}

	nu, err := grpcClient.UpdateUser(context.TODO(), updateParams)
	s.A.Nil(err)
	s.A.Equal(updateParams.GetEmail(), nu.GetEmail(), "User email should be updated when not empty")
	s.A.NotEqual(updateParams.GetBalance(), nu.GetBalance(), "Balance shouldn't be updated when ChangeBalanceFlag is false")
	s.A.Equal(updateParams.GetId(), nu.GetId(), "Id never changes")

	// change balance
	updateParams = &userGen.UpdateUserParams{
		Id:            u.GetId(),
		Email:         "", //email remains the same
		Balance:       1000.0,
		ChangeBalance: true,
	}

	nu, err = grpcClient.UpdateUser(context.TODO(), updateParams)
	s.A.Nil(err)
	s.A.NotEqual(updateParams.GetEmail(), nu.GetEmail(), "User email should not update when empty")
	s.A.Equal(updateParams.GetBalance(), nu.GetBalance(), "Balance should be updated")

	// invalid/non existent id
	updateParams = &userGen.UpdateUserParams{
		Id:            "-666",
		Email:         "", //email remains the same
		Balance:       1000.0,
		ChangeBalance: true,
	}

	nu, err = grpcClient.UpdateUser(context.TODO(), updateParams)
	s.A.NotNil(err)
	s.A.Equal(codes.NotFound, grpc.Code(err))
	s.A.Nil(nu)

	//no changes
	updateParams = &userGen.UpdateUserParams{
		Id:            u.GetId(),
		Email:         "", //email remains the same
		Balance:       1000.0,
		ChangeBalance: false, // balance too
	}

	nu, err = grpcClient.UpdateUser(context.TODO(), updateParams)
	s.A.NotNil(err)
	s.A.Equal(codes.Canceled, grpc.Code(err))
	s.A.Nil(nu)

	// db error
	db.Engine.DropTables(&user.Users{})
	updateParams = &userGen.UpdateUserParams{
		Id:            u.GetId(),
		Email:         "user@domain.com", //email remains the same
		Balance:       1000.0,
		ChangeBalance: true, // balance too
	}

	nu, err = grpcClient.UpdateUser(context.TODO(), updateParams)
	s.A.NotNil(err)
	s.A.Equal(codes.Unknown, grpc.Code(err))
	s.A.Nil(nu)
}

func (s *ServerFunctionalSuite) TestVerifyUser() {
	db.Engine.CreateTables(&user.Users{})
	// parse error
	v := &userGen.Verify{
		Guid: "aguid",
		Id:   "fdgdfsg",
	}

	u, err := grpcClient.VerifyUser(context.TODO(), v)
	s.A.False(u.GetCanUserFund())
	s.A.Equal(codes.NotFound, grpc.Code(err))

	//success
	uss := &user.Users{ // user fixture
		Email:   "user42@example.com",
		Balance: 100.00,
	}

	db.Engine.InsertOne(uss)

	v = &userGen.Verify{
		Guid:   "another guid",
		Id:     fmt.Sprintf("%d", uss.ID),
		Amount: 50.00,
	}

	u, err = grpcClient.VerifyUser(context.TODO(), v)
	s.A.True(u.GetCanUserFund())
	s.A.Equal(codes.OK, grpc.Code(err))

	//user can't fund
	v = &userGen.Verify{
		Guid:   "another guid",
		Id:     fmt.Sprintf("%d", uss.ID),
		Amount: 101.00,
	}

	u, err = grpcClient.VerifyUser(context.TODO(), v)
	s.A.False(u.GetCanUserFund())
	s.A.Equal(codes.OK, grpc.Code(err))

	//user not found
	v = &userGen.Verify{
		Guid:   "another guid",
		Id:     "23434234", //not in test db
		Amount: 101.00,
	}

	u, err = grpcClient.VerifyUser(context.TODO(), v)
	s.A.False(u.GetCanUserFund())
	s.A.Equal(codes.NotFound, grpc.Code(err))

	//db error
	db.Engine.DropTables(&user.Users{})
	u, err = grpcClient.VerifyUser(context.TODO(), v)
	s.A.False(u.GetCanUserFund())
	s.A.Equal(codes.Unknown, grpc.Code(err))
}
