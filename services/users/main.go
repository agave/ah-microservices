package main

import (
	"os"

	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/util"
	config "github.com/gypsydiver/go-config"
)

func init() {
	configureLogger()
	configInit()
	//dbClientInit()
}

func configureLogger() {
	log.SetFormatter(&log.JSONFormatter{})
	log.SetOutput(os.Stdout)
	log.SetLevel(log.InfoLevel)
}

func configInit() {
	if err := config.GetConfig(util.Config, "config.yml"); err != nil {
		log.WithField("error", err).Fatalln("Error loading configuration")
	}
}

func main() {
	log.Info("Awesome sauce")
	// events.LaunchConsumer()
	// events.LaunchProducer()
	// server.StartServer()
}
