package events

import (
	"encoding/json"
	"fmt"

	"github.com/Shopify/sarama"
	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/user"
)

var Producer *EventProducer

type EventProducer struct {
	AsyncProducer sarama.AsyncProducer
	Successes     int64
	Errors        int64
	Topic         string
}

func (s *EventProducer) Init() (err error) {
	s.AsyncProducer, err = sarama.NewAsyncProducerFromClient(KafkaClient)
	if err != nil {
		log.WithField("error", err).Panicln("Error on Producer creation")
	}
	return
}

func (s *EventProducer) HandleIncoming() {
	for {
		select {
		case suc := <-s.AsyncProducer.Successes():
			if suc != nil {
				s.Successes++
				logMessage(suc, "Success")
			}
		case err := <-s.AsyncProducer.Errors():
			if err != nil {
				s.Errors++
				log.WithField("Error", err.Err).Info()
				logMessage(err.Msg, "Error")
			}
		}
	}
}

func (s *EventProducer) Outbound(msg *user.Event) error {
	if msg == nil {
		return fmt.Errorf("Message can't be nil")
	}

	value, _ := json.Marshal(msg)
	out := &sarama.ProducerMessage{
		Topic: s.Topic, Value: sarama.ByteEncoder(value),
		Key: sarama.StringEncoder(msg.Key),
	}

	logMessage(out, "Outbound Message")
	s.AsyncProducer.Input() <- out
	return nil
}

func LaunchProducer() {
	Producer = &EventProducer{Topic: "user"}
	Producer.Init()
	go Producer.HandleIncoming()
}

func logMessage(m *sarama.ProducerMessage, msg string) {
	bValue, _ := m.Value.Encode()
	log.WithFields(log.Fields{
		"Key": m.Key, "Topic": m.Topic, "Value": string(bValue),
		"Partition": m.Partition, "Timestamp": m.Timestamp,
	}).Info(msg)
}
