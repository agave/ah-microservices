package events

import (
	"encoding/json"
	"fmt"

	"github.com/Shopify/sarama"
	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/user"
)

// Producer will be our runtime object for producing messages
var Producer *EventProducer

// EventProducer is a custom struct that encapsulates sarama's Producer
// this is for mockability and result tracking during testing
type EventProducer struct {
	AsyncProducer sarama.AsyncProducer
	Successes     int64
	Errors        int64
	Topic         string
}

// Init initializes out AsyncProducer
func (s *EventProducer) Init() (err error) {
	s.AsyncProducer, err = sarama.NewAsyncProducerFromClient(KafkaClient)
	if err != nil {
		log.WithField("error", err).Panicln("Error on Producer creation")
	}
	return
}

// HandleIncoming counts and reports both errors and successes
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

// Outbound receives a user.Event and produces it to the kafka queue
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

// LaunchProducer creates a Kafka Producer that translates outbound messages
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
