package server

import (
	"net"
	"os"
	"testing"

	log "github.com/Sirupsen/logrus"
	userGen "github.com/agave/ah-microservices/services/users/user/generated"
	"github.com/agave/ah-microservices/services/users/util"
	config "github.com/gypsydiver/go-config"
	"github.com/stretchr/testify/suite"
	"google.golang.org/grpc"
)

var (
	grpcServer *grpc.Server
	grpcClient userGen.UserClient
	conn       *grpc.ClientConn
	listener   net.Listener
)

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
