package db

import (
	"github.com/Sirupsen/logrus"
	"github.com/go-xorm/core"
	"github.com/go-xorm/xorm"
	_ "github.com/lib/pq" // this is how xorm harnesses db drivers
)

// Engine is the main entrypoint for database operations
var Engine EngineInterface

// InitDB creates an instance of xorm.Engine
func InitDB(driver, url string) (err error) {
	Engine, err = xorm.NewEngine(driver, url)
	if err != nil {
		return
	}
	Engine.SetMapper(core.GonicMapper{})
	Engine.ShowSQL(true)

	logger := logrus.New()
	logger.Formatter = &logrus.JSONFormatter{}

	nsl := xorm.NewSimpleLogger(logger.Writer())
	Engine.SetLogger(nsl)
	Engine.Logger().SetLevel(core.LOG_DEBUG)
	return
}

// EngineInterface is used to mock db methods during unit tests
type EngineInterface interface {
	Get(bean interface{}) (bool, error)
	Insert(beans ...interface{}) (int64, error)
	InsertOne(bean interface{}) (int64, error)
	SetMapper(mapper core.IMapper)
	ShowSQL(show ...bool)
	Logger() core.ILogger
	SetLogger(logger core.ILogger)
	NewSession() *xorm.Session
	CreateTables(beans ...interface{}) error
	DropTables(beans ...interface{}) error
	Close() error
}

// SessionInterface is used to mock xorm.Session objects during unit tests
type SessionInterface interface {
	Begin() error
	Close()
	Cols(columns ...string) *xorm.Session
	Id(id interface{}) *xorm.Session
	Insert(beans ...interface{}) (int64, error)
	InsertOne(beans interface{}) (int64, error)
	Commit() error
	Rollback() error
	Update(bean interface{}, condiBean ...interface{}) (int64, error)
}
