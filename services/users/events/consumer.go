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

var Consumer *EventConsumer

type EventConsumer struct {
	ClusterConsumer *cluster.Consumer
}

func (s *EventConsumer) Init() (err error) {
	s.ClusterConsumer, err = cluster.NewConsumerFromClient(KafkaClient,
		util.Config.GroupID, util.Config.Topics)
	if err != nil {
		log.WithField("error", err).Fatalln("Error on Consumer creation")
	}
	return
}

//TODO: notify errors, log topic
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
