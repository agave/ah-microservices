package user

import (
	"testing"

	"github.com/stretchr/testify/suite"
)

func TestUser(t *testing.T) {
	t.Run("unit", func(t *testing.T) {
		suite.Run(t, new(UserUnitSuite))
	})

	t.Run("functional", func(t *testing.T) {
		suite.Run(t, new(UserFunctionalSuite))
	})
}
