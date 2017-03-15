package user

import (
	"encoding/json"
	"fmt"

	"github.com/agave/ah-microservices/services/users/db"
	"github.com/go-xorm/xorm"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type UsersMockEngine struct {
	xorm.Engine
	GetTimesCalled int
	FeatureFlag    bool
}

func (s *UsersMockEngine) Get(bean interface{}) (bool, error) {
	defer func() {
		s.GetTimesCalled++
	}()

	if s.FeatureFlag {
		switch s.GetTimesCalled {
		case 0:
			return false, fmt.Errorf("")
		case 1:
			return false, nil
		}
		return true, nil
	}

	switch s.GetTimesCalled {
	case 0:
		return false, fmt.Errorf("")
	case 1:
		return true, nil
	}
	return false, nil
}

type UserUnitMockSession struct {
	xorm.Session
	BeginTimesCalled    int
	InsertTimesCalled   int
	RollbackTimesCalled int
	CommitTimesCalled   int
	CloseTimesCalled    int
}

func (s *UserUnitMockSession) Insert(beans ...interface{}) (int64, error) {
	defer func() {
		s.InsertTimesCalled++
	}()
	switch s.InsertTimesCalled {
	case 0:
		return 0, fmt.Errorf("")
	case 1:
		return 0, nil
	}
	return 1, nil
}

func (s *UserUnitMockSession) Rollback() error {
	s.RollbackTimesCalled++
	return nil
}

func (s *UserUnitMockSession) Begin() error {
	s.BeginTimesCalled++
	return nil
}
func (s *UserUnitMockSession) Commit() error {
	s.CommitTimesCalled++
	return nil
}

type MockDBWrapper struct {
	UpdateBalanceTimesCalled int
}

func (s *MockDBWrapper) UpdateBalance(u *Users) (int64, error) {
	defer func() {
		s.UpdateBalanceTimesCalled++
	}()
	switch s.UpdateBalanceTimesCalled {
	case 0:
		return 0, fmt.Errorf("")
	}
	return 1, nil
}

func (s *MockDBWrapper) NewSession() {}

func (s *MockDBWrapper) Close() {}

type UserUnitSuite struct {
	suite.Suite
	DB        *UsersMockEngine
	A         *assert.Assertions
	DBSession *UserUnitMockSession
	Up        *MockDBWrapper
}

func (s *UserUnitSuite) SetupSuite() {
	s.A = assert.New(s.T())
	s.DB = &UsersMockEngine{}
	db.Engine = s.DB
	s.DBSession = &UserUnitMockSession{}
	transactionSession = s.DBSession
	session = &MockDBWrapper{}
}

func (s *UserUnitSuite) SetupTest() {
	s.DB.GetTimesCalled = 0
}

func (s *UserUnitSuite) TestCheckHeldBalance() {
	iu := InvoiceUpdated{}
	b, err := checkHeldBalance(&iu)
	s.A.False(b)
	s.A.NotNil(err)

	a, err := checkHeldBalance(&iu)
	s.A.Nil(err)
	s.A.True(a)
}

func (s *UserUnitSuite) TestHoldBalance() {
	iu := &InvoiceUpdated{}
	u := &Users{}
	a, err := holdBalance(iu, u)
	s.A.False(a)
	s.A.NotNil(err)

	a, err = holdBalance(iu, u)
	s.A.True(a)
	s.A.Nil(err)

	a, err = holdBalance(iu, u)
	s.A.Equal(1, s.DBSession.BeginTimesCalled, "Session.Begin should be called once")
	s.DBSession.BeginTimesCalled = 0
	s.A.Equal(1, s.DBSession.RollbackTimesCalled, "Session.Rollback should be called once")
	s.DBSession.RollbackTimesCalled = 0
	s.A.False(a)
	s.A.NotNil(err)

	a, err = holdBalance(iu, u)
	s.A.False(a)
	s.A.NotNil(err)

	a, err = holdBalance(iu, u)
	s.A.Equal(1, s.DBSession.RollbackTimesCalled, "Session.Rollback should be called once")
	s.A.False(a)
	s.A.NotNil(err)

	a, err = holdBalance(iu, u)
	s.A.Equal(1, s.DBSession.CommitTimesCalled, "Session.Commit should be called once")
	s.A.True(a)
	s.A.Nil(err)
}

func (s *UserUnitSuite) TestEventBuilder() {
	c := &Activity{
		InvoiceID: 1, UserID: 2,
	}
	e := eventBuilder("typ", "guid", "key", c)
	s.A.Equal("typ", e.Type)
	s.A.Equal("guid", e.GUID)
	s.A.Equal("key", e.Key)
	bytes, _ := json.Marshal(c)
	s.A.Equal(string(bytes), e.Body)
}

func (s *UserUnitSuite) TestPendingFund() {
	s.DB.FeatureFlag = true
	invoice := &InvoiceUpdated{
		ID:         1,
		InvestorID: 2,
		Amount:     10,
		Status:     "pending_fund",
	}

	pe := &Event{
		GUID: "guid",
		Key:  "key",
	}

	e, err := pendingFund(invoice, pe)
	s.A.Nil(e)
	s.A.NotNil(err)

	e, err = pendingFund(invoice, pe)
	s.A.Equal(pe.GUID, e.GUID)
	s.A.Equal(pe.Key, e.Key)
	s.A.Equal("FunderNotFound", e.Type)

	e, err = pendingFund(invoice, pe)
	s.A.Equal(pe.GUID, e.GUID)
	s.A.Equal(pe.Key, e.Key)
	s.A.Equal("InsufficientBalance", e.Type)

	invoice.Amount = 0
	e, err = pendingFund(invoice, pe)
	s.A.Equal(pe.GUID, e.GUID)
	s.A.Equal(pe.Key, e.Key)
	s.A.Equal("BalanceReserved", e.Type)
	s.A.Nil(err)
}
