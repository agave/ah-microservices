package db

import (
	"github.com/Sirupsen/logrus"
	"github.com/go-xorm/core"
	"github.com/go-xorm/xorm"
	_ "github.com/lib/pq" // this is how xorm harnesses db drivers
)

// Engine is the main entrypoint for database operations
var Engine *xorm.Engine

// InitDB creates an instance of xorm.Engine
func InitDB(driver, url string) (err error) {
	Engine, err = xorm.NewEngine(driver, url)
	Engine.SetMapper(core.GonicMapper{})
	Engine.ShowSQL(true)

	logger := logrus.New()
	logger.Formatter = &logrus.JSONFormatter{}

	nsl := xorm.NewSimpleLogger(logger.Writer())
	Engine.SetLogger(nsl)
	Engine.Logger().SetLevel(core.LOG_DEBUG)
	return
}
