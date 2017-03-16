package user

import (
	"encoding/json"
	"fmt"

	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/db"
)

var session updaterInterface
var transactionSession db.SessionInterface

type updaterInterface interface {
	UpdateBalance(*Users) (int64, error)
	NewSession()
	Close()
}

type dbWrapper struct{}

func (s *dbWrapper) UpdateBalance(u *Users) (int64, error) {
	return transactionSession.Id(u.ID).Cols("balance").Update(u)
}
func (s *dbWrapper) NewSession() {
	transactionSession = db.Engine.NewSession()
}

func (s *dbWrapper) Close() {
	transactionSession.Close()
}

func init() {
	session = &dbWrapper{}
}

// SortConsumedMessage is called everytime a message is consumed and its job
// is to call the relevant controller to process such message
func SortConsumedMessage(pe *Event) (*Event, error) {
	logEventError(nil, pe, "Incoming event")
	switch pe.Type {
	case "InvoiceUpdated":
		return handleInvoiceUpdated(pe)
	case "ReservationNotFound":
		// check if held balance, otherwise just log
	default:
		logEventError(nil, pe,
			"Message Consumed, yet no handler was found for its type")
	}
	return nil, nil
}

func handleInvoiceUpdated(pe *Event) (*Event, error) {
	var invoice InvoiceUpdated
	err := json.Unmarshal([]byte(pe.Body), &invoice)
	if err != nil {
		logEventError(err, pe, "Malformed Event")
		return nil, nil // message should be discarded
	}
	switch invoice.Status {
	case "pending_fund":
		return pendingFund(&invoice, pe)
	case "funded":
		return funded(&invoice, pe)
	default:
		// log
	}
	return nil, nil //status
}

func pendingFund(invoice *InvoiceUpdated, pe *Event) (*Event, error) {
	// check InvestorID exists
	investor := &Users{ID: invoice.InvestorID}
	exists, err := db.Engine.Get(investor)
	if err != nil {
		logEventError(err, pe, "DB error while looking for investor")
		return nil, err
	}
	// Not found
	if !exists {
		logEventError(nil, pe, "Investor Not Found")
		return eventBuilder("FunderNotFound", pe.GUID, pe.Key,
			&Activity{invoice.ID, invoice.InvestorID}), nil
	}
	// check balance
	if investor.Balance < invoice.Amount {
		logEventError(nil, pe, "Insufficient Balance")
		return eventBuilder("InsufficientBalance", pe.GUID,
			fmt.Sprint(investor.ID), &Activity{invoice.ID, investor.ID}), nil
	}
	// hold balance
	session.NewSession()
	defer session.Close()
	suc, err := holdBalance(invoice, investor)
	if err != nil {
		logEventError(err, pe, "Couldn't create held_balance record")
		return nil, err
	}
	// success
	if suc {
		return eventBuilder("BalanceReserved", pe.GUID,
			fmt.Sprint(investor.ID), &Activity{invoice.ID, investor.ID}), nil
	}
	return nil, nil
}

func funded(invoice *InvoiceUpdated, pe *Event) (*Event, error) {
	// look for/remove held_balance record
	// produce UserUpdated event
	// return status
	return nil, nil
}

func holdBalance(invoice *InvoiceUpdated, u *Users) (bool, error) {
	//check if balance already held
	alr, err := checkHeldBalance(invoice)
	if err != nil {
		return false, err
	}

	if alr {
		return true, err
	}

	// hold_balance create
	hb := HeldBalance{
		UserID:    invoice.InvestorID,
		InvoiceID: invoice.ID,
		Amount:    invoice.Amount,
	}

	transactionSession.Begin()
	aff, err := transactionSession.InsertOne(&hb)
	if err != nil {
		transactionSession.Rollback()
		return false, err
	}

	if aff != 1 {
		transactionSession.Rollback()
		return false, fmt.Errorf("Rows affected: %d", aff)
	}

	// substract held balance from user
	u.Balance -= invoice.Amount
	afff, err := session.UpdateBalance(u)
	if err != nil || afff != 1 {
		u.Balance += invoice.Amount
		transactionSession.Rollback()
		return false, fmt.Errorf("Rows affected: %d, error: %v", afff, err)
	}

	return true, transactionSession.Commit()
}

func checkHeldBalance(invoice *InvoiceUpdated) (bool, error) {
	hb := HeldBalance{
		UserID:    invoice.InvestorID,
		InvoiceID: invoice.ID,
		Amount:    invoice.Amount,
	}
	return db.Engine.Get(&hb)
}

func logEventError(err error, pe *Event, msg string) {
	log.WithFields(log.Fields{
		"GUID": pe.GUID, "Type": pe.Type, "error": err, "event": pe,
	}).Info(msg)
}

func eventBuilder(typ, guid, key string, body *Activity) *Event {
	bytes, _ := json.Marshal(body)
	return &Event{Type: typ, GUID: guid, Body: string(bytes), Key: key}
}
