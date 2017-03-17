package main

import (
	"fmt"
	"os"

	"github.com/agave/ah-microservices/services/grpc-gateway/server"
	"github.com/agave/ah-microservices/services/grpc-gateway/util"
	config "github.com/gypsydiver/go-config"
)

// TODO: Log state of the process
func main() {
	setup()
	startServer()
}

func setup() {
	startConfig()
	// TODO: Add logger
	// startLogger()
}

func startConfig() {
	if err := config.GetConfig(&util.Config, "./config.yml"); err != nil {
		finishExecution(err.Error())
	}
}

// func startLogger() {}

func startServer() {
	if err := server.Serve(); err != nil {
		finishExecution(err.Error())
	}
}

func finishExecution(msg string) {
	fmt.Println(msg)
	os.Exit(1)
}
