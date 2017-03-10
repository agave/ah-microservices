package events

import (
	"encoding/json"

	"github.com/Shopify/sarama"
	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/user"
	"github.com/agave/ah-microservices/services/users/util"
	cluster "github.com/bsm/sarama-cluster"
)

func consumerInit() *cluster.Consumer {
	c, err := cluster.NewConsumerFromClient(KafkaClient,
		util.Config.GroupID, util.Config.Topics)
	if err != nil {
		log.WithField("error", err).Fatalln("Error on Consumer creation")
	}
	return c
}

//TODO: commit consume, notify errors, log topic
func listen(c *cluster.Consumer) {
	for {
		m := <-c.Messages()
		event, err := parseEvent(m)
		if err != nil {
			//do something
			continue
		}
		// p := user.SortConsumedMessage(&event)
		user.SortConsumedMessage(&event)
		//produce(p)

		// case shutdown notify:
		// pc.AsyncClose()
	}
}

// LaunchConsumer creates a Kafka Consumer that listens for incoming messages
func LaunchConsumer() {
	go listen(consumerInit())
}

func parseEvent(m *sarama.ConsumerMessage) (e user.Event, err error) {
	err = json.Unmarshal(m.Value, e)
	return e, err
}
