package server

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"testing"
	"time"

	userGen "github.com/agave/ah-microservices/services/grpc-gateway/api/user/generated"
	"github.com/agave/ah-microservices/services/grpc-gateway/util"

	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	gContext "golang.org/x/net/context"
	"google.golang.org/grpc"
)

type ServerTestSuite struct {
	suite.Suite
	assert     *assert.Assertions
	httpPort   string
	grpcPort   string
	grpcServer *grpc.Server
}

type mockServiceImpl struct {
	userGen.UserServer
}

// Get returns a mock user
func (service *mockServiceImpl) Get(
	ctx gContext.Context, id *userGen.UserId) (*userGen.UserInfo, error) {

	return &userGen.UserInfo{
		Balance: 0.0,
		Email:   "email",
	}, nil
}

func (suite *ServerTestSuite) registerMockGRPCEndpoint() {
	suite.grpcServer = grpc.NewServer()
	userGen.RegisterUserServer(suite.grpcServer, &mockServiceImpl{})
	conn, err := net.Listen("tcp",
		fmt.Sprintf("%s:%d", util.Config.AGHost, util.Config.AGPort))
	if err != nil {
		return
	}
	defer func() {
		// TODO: Log error
		err := conn.Close()
		fmt.Println(err)
	}()
	defer func() {
		// TODO: Log error
		err := suite.grpcServer.Serve(conn)
		fmt.Println(err)
	}()
}

func registerMockHTTPEndpoint(ctx context.Context, mux *runtime.ServeMux,
	endpoint string, opts []grpc.DialOption) (err error) {

	return userGen.RegisterUserHandlerFromEndpoint(
		ctx, mux, endpoint, opts)
}

func registerMockWrongHTTPEndpoint(ctx context.Context, mux *runtime.ServeMux,
	endpoint string, opts []grpc.DialOption) (err error) {

	return fmt.Errorf("Mock error")
}

func (suite *ServerTestSuite) SetupSuite() {
	suite.assert = assert.New(suite.T())
	util.Config = util.Configuration{
		SwaggerPath: "./",
		AGHost:      "",
		AGPort:      10000,
	}
	suite.httpPort = ":8000"
	suite.setupEndpoints()
	suite.deployTestServer()
}

func (suite *ServerTestSuite) TearDownSuite() {
	suite.grpcServer.GracefulStop()
}

func (suite *ServerTestSuite) setupEndpoints() {
	registeredHTTPEndpoints = []registerHTTPEndpoint{
		registerMockHTTPEndpoint,
		registerMockWrongHTTPEndpoint,
	}
}

func (suite *ServerTestSuite) deployTestServer() {
	go suite.registerMockGRPCEndpoint()

	go func() {
		if err := Serve(); err != nil {
			// TODO: Log error
			os.Exit(1)
		}
	}()
	time.Sleep(time.Second)
}

func (suite *ServerTestSuite) TestHTTPRequest() {
	resp, err := http.Get("http://localhost" + suite.httpPort + "/api/v1/users/1")
	fmt.Println(resp, err)
	// TODO: Parse json and check fields
	// body := read(resp)
	// jsonBody, err := parseJson(resp)
	// suite.assertJSONFields(jsonBody)
}

func (suite *ServerTestSuite) TestSwaggerRequest() {
	fmt.Println("http://localhost" + suite.httpPort + "/docs/test.json")
	resp, err := http.Get("http://localhost" + suite.httpPort + "/docs/test")
	fmt.Println(resp, err)
	// TODO: Parse json and check fields
	// body := read(resp)
	// jsonBody, err := parseJson(resp)
	// suite.assertJSONFields(jsonBody)
}

// func (suite *ServerTestSuite) assertJSONFields(jsonBody something) {
// 	email, _ := jsonBody.get("email")
// 	suite.assert.Equal("email", email)
// 	id, _ := jsonBody.get("id")
// 	suite.assert.Equal("id", id)
// 	name, _ := jsonBody.get("name")
// 	suite.assert.Equal("name", name)
// 	role, _ := jsonBody.get("role")
// 	suite.assert.Equal("role", role)
// }

func TestServer(t *testing.T) {
	suite.Run(t, new(ServerTestSuite))
}
