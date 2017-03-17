package events

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/Shopify/sarama"
	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/user"
	"github.com/agave/ah-microservices/services/users/util"
	cluster "github.com/bsm/sarama-cluster"
)

// Consumer will be our runtime object for consuming messages
var Consumer *EventConsumer

// EventConsumer is a custom struct that encapsulates cluster's Consumer
// this is for mockability and result tracking during testing
type EventConsumer struct {
	ClusterConsumer *cluster.Consumer
}

// Init initializes our ClusterConsumer to consume our configured topics
func (s *EventConsumer) Init() (err error) {
	s.ClusterConsumer, err = cluster.NewConsumerFromClient(KafkaClient,
		util.Config.GroupID, util.Config.Topics)
	if err != nil {
		log.WithField("error", err).Fatalln("Error on Consumer creation")
	}
	return
}

// Listen will be in charge of commiting offsets reporting errors and
// calling relevant controllers
func (s *EventConsumer) Listen() {
	for {
		m := <-s.ClusterConsumer.Messages()
		if m != nil {
			event, err := parseEvent(m)
			if err != nil {
				//TODO do something
				continue
			}
			produceEvent, err := user.SortConsumedMessage(event)
			if produceEvent != nil {
				Producer.Outbound(produceEvent)
			}
			if err == nil {
				s.ClusterConsumer.MarkOffset(m,
					fmt.Sprintf("%d", time.Now().Unix()))
				s.ClusterConsumer.CommitOffsets()
			}
		}
	}
}

func parseEvent(m *sarama.ConsumerMessage) (*user.Event, error) {
	var e user.Event
	err := json.Unmarshal(m.Value, &e)
	return &e, err
}

// LaunchConsumer creates a Kafka Consumer that listens for incoming messages
func LaunchConsumer() {
	Consumer = &EventConsumer{}
	Consumer.Init()
	go Consumer.Listen()
}
