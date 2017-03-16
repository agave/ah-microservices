package user

import (
	"os"

	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/db"
	"github.com/agave/ah-microservices/services/users/util"
	config "github.com/gypsydiver/go-config"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type UserFunctionalSuite struct {
	suite.Suite
	A *assert.Assertions
}

func (s *UserFunctionalSuite) SetupSuite() {
	s.A = assert.New(s.T())

	//db
	log.SetFormatter(&log.JSONFormatter{})
	log.SetOutput(os.Stdout)
	log.SetLevel(log.InfoLevel)

	if err := config.GetConfig(&util.Config, "../config.yml"); err != nil {
		log.WithField("error", err).Fatalln("Error loading configuration")
	}

	util.Config.DB.DBName = util.Config.DB.DBName + "_test"

	url := util.FormatDBURL("postgres", &util.Config.DB)
	err := db.InitDB("postgres", url)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err, "url": url,
		}).Fatalln("Error starting database")
		return
	}

	err = db.Engine.CreateTables(&Users{}, &HeldBalance{})
	if err != nil {
		log.WithField("error", err).Fatalln("Error creating tables")
	}
}

func (s *UserFunctionalSuite) TearDownSuite() {
	db.Engine.DropTables(&Users{}, &HeldBalance{})
	db.Engine.Close()
}

func (s *UserFunctionalSuite) TestCheckHeldBalance() {
	tc := &InvoiceUpdated{
		InvestorID: 123,
		ID:         3,
		Amount:     456.66,
	}

	e, err := checkHeldBalance(tc)
	s.A.Nil(err)
	s.A.False(e)

	hb := HeldBalance{
		UserID:    tc.InvestorID,
		Amount:    tc.Amount,
		InvoiceID: tc.ID,
	}

	a, err := db.Engine.Insert(&hb)
	s.A.Nil(err)
	s.A.Equal(int64(1), a)

	e, err = checkHeldBalance(tc)
	s.A.Nil(err)
	s.A.True(e)
}

func (s *UserFunctionalSuite) TestHoldBalance() {
	session = &dbWrapper{}
	session.NewSession()
	defer session.Close()

	tc := InvoiceUpdated{
		InvestorID: int64(987),
		ID:         int64(99),
		Amount:     6.66,
	}

	usr := Users{
		Balance: 100.00,
		Email:   "arandomuser@domain.com",
	}

	aff, err := db.Engine.Insert(&usr)
	s.A.Nil(err)
	s.A.Equal(int64(1), aff)

	a, err := holdBalance(&tc, &usr)
	s.A.True(a)
	s.A.Nil(err)

	uss := &Users{Email: "arandomuser@domain.com"}
	e, err := db.Engine.Get(uss)
	s.A.Nil(err)
	s.A.True(e)
	s.A.Equal(usr.Balance, uss.Balance)
}
