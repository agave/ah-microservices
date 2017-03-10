package server

import (
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type ServerUnitSuite struct {
	suite.Suite
	A *assert.Assertions
}

func (s *ServerUnitSuite) SetupSuite() {
	//Impl db.Engine.Insert
	//Impl db.Engine.Get
}

func (s *ServerUnitSuite) TestCreateUser() {

}
