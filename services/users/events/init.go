package events

import (
	"github.com/Shopify/sarama"
	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/util"
	cluster "github.com/bsm/sarama-cluster"
)

// KafkaClient holds kafka connection details to be used by consumers
// and producers
var KafkaClient *cluster.Client

func Init() {
	var err error
	conf := cluster.NewConfig()
	conf.Producer.Return.Errors = true
	conf.Producer.Return.Successes = true
	conf.Consumer.Offsets.Initial = sarama.OffsetOldest

	KafkaClient, err = cluster.NewClient(util.Config.KafkaBrokers, conf)
	if err != nil {
		log.WithField("error", err).Panicln("Error on Client creation")
	}
}
