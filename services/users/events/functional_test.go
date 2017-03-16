package events

import (
	"encoding/json"
	"time"

	"github.com/Shopify/sarama"
	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/db"
	"github.com/agave/ah-microservices/services/users/user"
	"github.com/agave/ah-microservices/services/users/util"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type EventsFunctionalSuite struct {
	suite.Suite
	A             *assert.Assertions
	UserFixtures  []*user.Users
	EventFixtures []*user.Event
}

func (s *EventsFunctionalSuite) SetupSuite() {
	s.A = assert.New(s.T())

	//Fixtures
	s.UserFixtures = []*user.Users{
		&user.Users{Email: "usera@domain.com", Balance: 100},
		&user.Users{Email: "userb@domain.com", Balance: 200},
		&user.Users{Email: "userc@domain.com", Balance: 300},
	}

	s.EventFixtures = []*user.Event{
		&user.Event{Type: "InvoiceUpdated", GUID: "1", Key: "1"},
		&user.Event{Type: "InvoiceUpdated", GUID: "2", Key: "2"},
		&user.Event{Type: "InvoiceUpdated", GUID: "3", Key: "3"},
		&user.Event{Type: "ReservationNotFound", GUID: "4", Key: "4"},
	}

	// db
	util.Config.DB.DBName = util.Config.DB.DBName + "_test"
	url := util.FormatDBURL("postgres", &util.Config.DB)
	err := db.InitDB("postgres", url)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err, "url": url,
		}).Fatalln("Error starting database")
		return
	}

	err = db.Engine.CreateTables(&user.Users{}, &user.HeldBalance{})
	if err != nil {
		log.WithField("error", err).Fatalln("Error creating tables")
		return
	}

	_, err = db.Engine.Insert(&s.UserFixtures)
	if err != nil {
		log.WithField("error", err).Fatalln("Error inserting fixtures")
		return
	}

	Init()
}

func (s *EventsFunctionalSuite) TearDownSuite() {
	db.Engine.Close()
	KafkaClient.Close()
}

func (s *EventsFunctionalSuite) TestProducer() {
	LaunchProducer()
	defer Producer.AsyncProducer.AsyncClose()
	err := Producer.Outbound(nil)
	s.A.NotNil(err)

	err = Producer.Outbound(s.EventFixtures[0])
	s.A.Nil(err)
	time.Sleep(time.Second)
	s.A.Equal(int64(1), Producer.Successes, "Producing message should be a success")

	KafkaClient.Close()
	err = Producer.Outbound(s.EventFixtures[0])
	s.A.Nil(err)
	time.Sleep(time.Second)
	s.A.Equal(int64(1), Producer.Errors, "Producing message should error")

	Init()
}

func (s *EventsFunctionalSuite) TestConsumer() {
	LaunchConsumer()
	defer Consumer.ClusterConsumer.Close()

	Producer = &EventProducer{Topic: "invoice"}
	Producer.Init()
	defer Producer.AsyncProducer.AsyncClose()
	go Producer.HandleIncoming()

	inv := user.InvoiceUpdated{
		InvestorID: s.UserFixtures[0].ID,
		Amount:     20,
		ID:         5,
	}

	body, _ := json.Marshal(inv)
	s.EventFixtures[0].Body = string(body)

	err := Producer.Outbound(s.EventFixtures[0])
	s.A.Nil(err)
}

func (s *EventsFunctionalSuite) TestParseEvent() {
	v := &user.Event{Type: "EventType", GUID: "123", Body: "", Key: "2"}
	vBytes, _ := json.Marshal(v)
	m := &sarama.ConsumerMessage{
		Value: vBytes,
	}

	a, err := parseEvent(m)
	s.A.Nil(err)
	s.A.Equal(v.Type, a.Type)
	s.A.Equal(v.GUID, a.GUID)
	s.A.Equal(v.Body, a.Body)
	s.A.Equal(v.Key, a.Key)
}
