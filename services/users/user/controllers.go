package user

import (
	"encoding/json"
	"fmt"
	"strconv"

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
	logEventAndOrError(nil, pe, "Incoming event")
	switch pe.Type {
	case "InvoiceUpdated":
		return handleInvoiceUpdated(pe)
	case "ReservationNotFound":
		// check if held balance, otherwise just log
		logEventAndOrError(nil, pe, "ReservationNotFound ACK, nothing to do")
	default:
		logEventAndOrError(nil, pe,
			"Message Consumed, yet no handler was found for its type")
	}
	return nil, nil
}

func handleInvoiceUpdated(pe *Event) (*Event, error) {
	var invoice InvoiceUpdated
	err := json.Unmarshal([]byte(pe.Body), &invoice)
	if err != nil {
		logEventAndOrError(err, pe, "Malformed Event")
		return nil, nil // message should be discarded
	}
	switch invoice.Status {
	case "pending_fund":
		return pendingFund(&invoice, pe)
	case "funded":
		return funded(&invoice, pe)
	}
	return nil, nil //status
}

func pendingFund(invoice *InvoiceUpdated, pe *Event) (*Event, error) {
	// check InvestorID exists
	uid, _ := strconv.ParseInt(invoice.InvestorID, 10, 64)
	investor := &Users{ID: uid}
	exists, err := db.Engine.Get(investor)
	if err != nil {
		logEventAndOrError(err, pe, "DB error while looking for investor")
		return nil, err
	}
	// Not found
	if !exists {
		logEventAndOrError(nil, pe, "Investor Not Found")
		return eventBuilder("FunderNotFound", pe.GUID, pe.Key,
			&Activity{invoice.ID, invoice.InvestorID}), nil
	}
	// check balance
	if investor.Balance < invoice.Amount {
		logEventAndOrError(nil, pe, "Insufficient Balance")
		act := &Activity{
			InvoiceID: fmt.Sprintf("%d", invoice.ID),
			UserID:    fmt.Sprintf("%d", investor.ID),
		}
		return eventBuilder("InsufficientBalance", pe.GUID,
			fmt.Sprint(investor.ID), act), nil
	}
	// hold balance
	session.NewSession()
	defer session.Close()
	suc, err := holdBalance(invoice, investor)
	if err != nil {
		logEventAndOrError(err, pe, "Couldn't create held_balance record")
		return nil, err
	}
	// success
	if suc {
		act := &Activity{
			InvoiceID: fmt.Sprintf("%d", invoice.ID),
			UserID:    fmt.Sprintf("%d", investor.ID),
		}
		return eventBuilder("BalanceReserved", pe.GUID,
			fmt.Sprint(investor.ID), act), nil
	}
	return nil, nil
}

func funded(invoice *InvoiceUpdated, pe *Event) (*Event, error) {
	held, err := checkHeldBalance(invoice)
	if err != nil {
		logEventAndOrError(err, pe, "Couldn't check for held_balance record")
		return nil, err
	}
	if held {
		uid, _ := strconv.ParseInt(invoice.InvestorID, 10, 64)
		invid, _ := strconv.ParseInt(invoice.ID, 10, 64)
		aff, err := db.Engine.Delete(&HeldBalance{
			UserID:    uid,
			InvoiceID: invid,
			Amount:    invoice.Amount,
		})

		if err != nil || aff != 1 {
			msg := "Couldn't delete held_balance record, Rows affected: %d, err: %v"
			logEventAndOrError(err, pe,
				fmt.Sprintf(msg, aff, err))
			return nil, fmt.Errorf(msg, aff, err)
		}

		return eventBuilder("UserUpdated", pe.GUID,
			fmt.Sprint(invoice.InvestorID),
			&Activity{invoice.ID, invoice.InvestorID}), nil
	}

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

	uid, _ := strconv.ParseInt(invoice.InvestorID, 10, 64)
	invid, _ := strconv.ParseInt(invoice.ID, 10, 64)
	// hold_balance create
	hb := HeldBalance{
		UserID:    uid,
		InvoiceID: invid,
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
	uid, _ := strconv.ParseInt(invoice.InvestorID, 10, 64)
	invid, _ := strconv.ParseInt(invoice.ID, 10, 64)
	hb := HeldBalance{
		UserID:    uid,
		InvoiceID: invid,
		Amount:    invoice.Amount,
	}
	return db.Engine.Get(&hb)
}

func logEventAndOrError(err error, pe *Event, msg string) {
	log.WithFields(log.Fields{
		"GUID": pe.GUID, "Type": pe.Type, "error": err, "event": pe,
	}).Info(msg)
}

func eventBuilder(typ, guid, key string, body *Activity) *Event {
	bytes, _ := json.Marshal(body)
	return &Event{Type: typ, GUID: guid, Body: string(bytes), Key: key}
}
