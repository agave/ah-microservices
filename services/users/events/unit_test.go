package events

import (
	"github.com/Shopify/sarama"
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

	e, err = parseEvent(&sarama.ConsumerMessage{Value: []byte(b)})
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
