package server

import (
	"context"
	"net"
	"os"
	"testing"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"

	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/db"
	userGen "github.com/agave/ah-microservices/services/users/user/generated"
	"github.com/agave/ah-microservices/services/users/util"
	config "github.com/gypsydiver/go-config"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

var (
	grpcServer *grpc.Server
	grpcClient userGen.UserClient
	conn       *grpc.ClientConn
	listener   net.Listener
)

type ServerUnitSuite struct {
	suite.Suite
	A *assert.Assertions
}

func (s *ServerUnitSuite) SetupSuite() {
	//Impl db.Engine.Insert
	//Impl db.Engine.Get
}

func (s *ServerUnitSuite) TestCreateUser() {

}

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
	}
}

func (s *ServerFunctionalSuite) TearDownSuite() {
	db.Engine.Close()
}

func (s *ServerFunctionalSuite) TestGetUser() {
	type testCases struct {
		Ins  []*userGen.Id
		Outs []codes.Code
	}

	tc := testCases{
		Ins: []*userGen.Id{
			&userGen.Id{Guid: "1", Id: 1},     // happy
			&userGen.Id{Guid: "2", Id: 10000}, // not found
			&userGen.Id{Guid: "3", Id: -99999},
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
			s.A.Equal(v.GetId(), p.GetID(), "Should return same id")
			s.A.NotEmpty(p.GetEmail(), "Email shouldn't be empty")
		}
	}
}

func (s *ServerFunctionalSuite) TestCreateUser() {
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
}

func TestServer(t *testing.T) {
	commonSetup()

	t.Run("unit", func(t *testing.T) {
		suite.Run(t, new(ServerUnitSuite))
	})

	t.Run("functional", func(t *testing.T) {
		suite.Run(t, new(ServerFunctionalSuite))
	})

	commonTearDown()
}

func commonSetup() {
	log.SetFormatter(&log.JSONFormatter{})
	log.SetOutput(os.Stdout)
	log.SetLevel(log.InfoLevel)

	if err := config.GetConfig(&util.Config, "../config.yml"); err != nil {
		log.WithField("error", err).Fatalln("Error loading configuration")
	}

	// server
	serverAddress := ":10000"
	grpcServer = createGRPCServer()
	listener = createNetListener(serverAddress)
	go grpcServer.Serve(listener)

	// client
	var err error
	conn, err = grpc.Dial(serverAddress, grpc.WithInsecure())
	if err != nil {
		log.WithField("error", err).Error("Failed to create client")
	}
	grpcClient = userGen.NewUserClient(conn)
}

func createGRPCServer() (s *grpc.Server) {
	s = grpc.NewServer()
	userGen.RegisterUserServer(s, &userServer{})
	return
}

func createNetListener(addr string) (lis net.Listener) {
	var err error
	lis, err = net.Listen("tcp", addr)
	if err != nil {
		log.WithField("error", err).Error("failed to listen")
	}
	return
}

func commonTearDown() {
	grpcServer.GracefulStop()
	conn.Close()
	listener.Close()
}
