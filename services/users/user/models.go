package user

// Users model
type Users struct {
	ID      int64   `xorm:"serial autoincr pk notnull unique 'id'"`
	Email   string  `xorm:"text unique notnull 'email'"`
	Balance float64 `xorm:"numeric(26,2) 'balance'"`
}

// HeldBalance model
type HeldBalance struct {
	ID        int64   `xorm:"serial autoincr pk notnull unique 'id'"`
	UserID    int64   `xorm:"notnull 'user_id'"`
	InvoiceID int64   `xorm:"notnull 'invoice_id'"`
	Amount    float64 `xorm:"numeric(26,2) 'amount'"`
}
