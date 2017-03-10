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

// MockEngine is for unit testing
type MockEngine struct {
	xorm.Engine
	Session *MockSession
}

func (s *MockEngine) Get(bean interface{}) (bool, error)         { return false, nil }
func (s *MockEngine) Insert(beans ...interface{}) (int64, error) { return 0, nil }
func (s *MockEngine) InsertOne(bean interface{}) (int64, error)  { return 0, nil }
func (s *MockEngine) NewSession() *MockSession                   { return s.Session }

type MockSession struct {
	xorm.Session
}

func (s *MockSession) Begin() error                                                     { return nil }
func (s *MockSession) Close()                                                           {}
func (s *MockSession) Cols(columns ...string) *MockSession                              { return s }
func (s *MockSession) Commit() error                                                    { return nil }
func (s *MockSession) Id(id interface{}) *MockSession                                   { return s }
func (s *MockSession) Rollback() error                                                  { return nil }
func (s *MockSession) Update(bean interface{}, condiBean ...interface{}) (int64, error) { return 0, nil }
