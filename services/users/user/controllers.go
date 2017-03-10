package user

import (
	"encoding/json"
	"fmt"

	log "github.com/Sirupsen/logrus"
	"github.com/agave/ah-microservices/services/users/db"
)

// SortConsumedMessage is called everytime a message is consumed and its job
// is to call the relevant controller to process such message
func SortConsumedMessage(pe *Event) *Event {
	switch pe.Type {
	case "InvoiceUpdated":
		// ua, err := handleInvoiceUpdated(pe)

	case "ReservationNotFound":
		// check if held balance, otherwise just log
	default:
		// log.WithField("message", string(m.Value)).Info("Message Consumed")
	}
	return nil
}

func handleInvoiceUpdated(pe *Event) (err error) {
	var iu InvoiceUpdated
	err = json.Unmarshal([]byte(pe.Body), &iu)
	if err != nil {
		logEventError(err, pe, "Malformed Event")
		return
	}
	switch iu.Status {
	case "pending_fund":
		// check InvestorID exists
		exists, investor := checkInvestor(iu.InvestorID)
		if !exists {
			logEventError(nil, pe, "Investor Not Found")
			return //produce FunderNotFound
		}
		// check balance
		if investor.Balance < iu.Amount {
			logEventError(nil, pe, "Insufficient Balance")
			return // produce InsufficientBalance
		}
		// hold balance
		suc, err := holdBalance(&iu, investor)
		if err != nil {
			logEventError(err, pe, "Couldn't create held_balance record")
		}

		if suc {
			// produce BalanceReserved
			return nil
		}
	case "funded":
		// look for/remove held_balance record
		// maybe produce an event
		// return status
	default:
		// log
	}
	return //status
}

func checkInvestor(id int64) (bool, *Users) {
	u := Users{ID: id}
	e, err := db.Engine.Get(&u)
	if err != nil {
		//log
		// TODO: try again
		return false, &Users{}
	}
	return e, &u
}

func holdBalance(iu *InvoiceUpdated, u *Users) (bool, error) {
	//check if balance already held
	alr := checkHeldBalance(iu)
	if alr {
		return true, nil
	}

	// hold_balance create
	hb := HeldBalance{
		UserID: iu.InvestorID, InvoiceID: iu.ID, Amount: iu.Amount,
	}

	session := db.Engine.NewSession()
	defer session.Close()

	session.Begin()
	aff, err := session.Insert(&hb)
	if err != nil {
		session.Rollback()
		return false, err
	}

	if aff != 1 {
		return false, fmt.Errorf("Rows affected: %d", aff)
	}

	// substract held balance from user
	u.Balance -= iu.Amount
	afff, err := session.Id(u.ID).Cols("balance").Update(&u)
	if err != nil || afff != 1 {
		session.Rollback()
		return false, fmt.Errorf("Rows affected: %d, error: %v", afff, err)
	}

	session.Commit()
	return true, nil
}

func checkHeldBalance(iu *InvoiceUpdated) bool {
	hb := HeldBalance{
		UserID:    iu.InvestorID,
		InvoiceID: iu.ID,
		Amount:    iu.Amount,
	}
	e, err := db.Engine.Get(&hb)
	if err != nil {
		// log
		// TODO: try again
		return false
	}
	return e
}

func logEventError(err error, pe *Event, msg string) {
	log.WithFields(log.Fields{
		"GUID": pe.GUID, "Type": pe.Type, "error": err, "event": pe,
	}).Info(msg)
}

func eventBuilder(typ, guid, key string, body *UserActivity) *Event {
	switch typ {
	case "BalanceReserved":

	}
	return nil
}
