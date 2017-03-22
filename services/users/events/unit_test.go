package events

import (
	"errors"
	"time"

	"github.com/Shopify/sarama"
	"github.com/Shopify/sarama/mocks"
	"github.com/agave/ah-microservices/services/users/user"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type EventsUnitSuite struct {
	suite.Suite
	A *assert.Assertions
}

func (s *EventsUnitSuite) SetupSuite() {
	s.A = assert.New(s.T())
}
func (s *EventsUnitSuite) TearDownSuite() {}

func (s *EventsUnitSuite) TestParseEvent() {
	b := "{" //bad json
	g := `{"type": "", "guid":"guid", "key":"123"}`

	e, err := parseEvent(&sarama.ConsumerMessage{Value: []byte(g)})
	s.A.Nil(err)
	s.A.NotNil(e)

	_, err = parseEvent(&sarama.ConsumerMessage{Value: []byte(b)})
	s.A.NotNil(err)
}

func (s *EventsUnitSuite) TestInit() {
	err := Init()
	s.A.Nil(err)
	KafkaClient.Close()
}

func (s *EventsUnitSuite) TestConsumerInit() {
	Init()
	defer KafkaClient.Close()
	ec := &EventConsumer{}
	err := ec.Init()
	s.A.Nil(err)
	ec.ClusterConsumer.Close()
}

func (s *EventsUnitSuite) TestProducerInit() {
	Init()
	defer KafkaClient.Close()
	ep := &EventProducer{}
	err := ep.Init()
	s.A.Nil(err)
	ep.AsyncProducer.Close()
}

func (s *EventsUnitSuite) TestProducer() {
	conf := sarama.NewConfig()
	conf.Producer.Return.Errors = true
	conf.Producer.Return.Successes = true

	mp := mocks.NewAsyncProducer(s.T(), conf)
	mp.ExpectInputAndSucceed()
	mp.ExpectInputAndFail(errors.New(""))

	producer := &EventProducer{
		AsyncProducer: mp,
	}
	defer producer.AsyncProducer.AsyncClose()

	go producer.HandleIncoming()

	suc := &user.Event{
		Type: "Test",
	}

	err := producer.Outbound(suc)
	time.Sleep(time.Second)
	s.A.Nil(err)
	s.A.Equal(int64(1), producer.Successes)

	err = producer.Outbound(suc)
	time.Sleep(time.Second)
	s.A.Equal(int64(1), producer.Errors)
}
