package util

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type UtilSuite struct {
	suite.Suite
	A *assert.Assertions
}

func (s *UtilSuite) SetupSuite() {
	s.A = assert.New(s.T())
}

func (s *UtilSuite) TestFormatDBURL() {
	cases := make(map[string]*DBOptions)

	cases["://user:pass@host:123/name?option=true&another=false"] = &DBOptions{
		Username: "user", Password: "pass",
		Host: "host", Port: 123,
		DBName: "name", Options: []string{"option=true", "another=false"},
	}

	cases["://:@:0/"] = &DBOptions{}

	for k, v := range cases {
		s.A.Equal("postgres"+k, FormatDBURL("postgres", v),
			"Expected and actual should be equal")
	}
}

func TestUtil(t *testing.T) {
	t.Run("unit", func(t *testing.T) {
		suite.Run(t, new(UtilSuite))
	})

	t.Run("functional", func(t *testing.T) {
		suite.Run(t, new(UtilSuite))
	})
}
