package events

import (
	"os"
	"testing"

	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/util"
	config "github.com/gypsydiver/go-config"
	"github.com/stretchr/testify/suite"
)

func TestUser(t *testing.T) {
	commonSetup()

	// t.Run("unit", func(t *testing.T) {
	// 	suite.Run(t, new(UserUnitSuite))
	// })

	t.Run("functional", func(t *testing.T) {
		suite.Run(t, new(EventsFunctionalSuite))
	})
}

func commonSetup() {
	log.SetFormatter(&log.JSONFormatter{})
	log.SetOutput(os.Stdout)
	log.SetLevel(log.InfoLevel)

	if err := config.GetConfig(&util.Config, "../config.yml"); err != nil {
		log.WithField("error", err).Fatalln("Error loading configuration")
	}
}
