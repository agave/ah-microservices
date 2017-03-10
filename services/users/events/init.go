package events

import (
	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/util"
	cluster "github.com/bsm/sarama-cluster"
)

// KafkaClient holds kafka connection details to be used by consumers
// and producers
var KafkaClient *cluster.Client

func init() {
	var err error
	conf := cluster.NewConfig()
	KafkaClient, err = cluster.NewClient(util.Config.KafkaBrokers, conf)

	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Panicln("Error on Client creation")
	}
}
