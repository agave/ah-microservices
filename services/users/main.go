package main

import (
	"os"

	log "github.com/Sirupsen/logrus"
)

func init() {
	configureLogger()
}

func configureLogger() {
	log.SetFormatter(&log.JSONFormatter{})
	log.SetOutput(os.Stdout)
	log.SetLevel(log.InfoLevel)
}

func main() {
	log.Info("Awesomesauce")
}
