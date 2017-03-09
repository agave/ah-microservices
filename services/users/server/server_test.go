package server

import (
	"context"
	"net"
	"os"
	"testing"

	"google.golang.org/grpc"

	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/db"
	userGen "github.com/agave/ah-microservices/services/users/user/generated"
	"github.com/agave/ah-microservices/services/users/util"
	config "github.com/gypsydiver/go-config"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type ServerUnitSuite struct {
	suite.Suite
}

type ServerFunctionalSuite struct {
	suite.Suite
	A        *assert.Assertions
	Server   *grpc.Server
	Client   userGen.UserClient
	Conn     *grpc.ClientConn
	Listener net.Listener
}

func (s *ServerFunctionalSuite) SetupSuite() {
	var err error
	s.A = assert.New(s.T())

	//server
	serverAddress := ":10000"
	s.Listener, err = net.Listen("tcp", serverAddress)
	if err != nil {
		log.WithField("error", err).Error("failed to listen")
	}

	s.Server = grpc.NewServer()
	userGen.RegisterUserServer(s.Server, &userServer{})
	go s.Server.Serve(s.Listener)

	//client
	s.Conn, err = grpc.Dial(serverAddress, grpc.WithInsecure())
	if err != nil {
		log.WithField("error", err).Error("Failed to create client")
	}
	s.Client = userGen.NewUserClient(s.Conn)
}

func (s *ServerFunctionalSuite) TearDownSuite() {
	s.Server.GracefulStop()
	s.Conn.Close()
	s.Listener.Close()
}

func (s *ServerFunctionalSuite) TestCreateUser() {
	c := &userGen.Create{
		Email:   "admin@admin.com",
		Balance: 100,
	}
	prof, err := s.Client.CreateUser(context.TODO(), c)
	s.A.Nil(err)
	s.A.NotNil(prof)
	s.A.Equal(c.Email, prof.Email, "Insert should return same Email")
	s.A.Equal(c.Balance, prof.Balance, "Insert should return same Balance")
}

func TestServer(t *testing.T) {
	commonSetup()

	// t.Run("unit", func(t *testing.T) {
	// 	suite.Run(t, new(ServerUnitSuite))
	// })

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

	util.Config.DB.DBName = util.Config.DB.DBName + "_test"

	url := util.FormatDBURL("postgres", &util.Config.DB)
	err := db.InitDB("postgres", url)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
			"url":   url,
		}).Fatalln("Error starting database")
	}
}

func commonTearDown() {
	db.Engine.Close()
}
