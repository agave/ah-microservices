package user

// Users model
type Users struct {
	ID          int32   `xorm:"serial autoincr pk notnull unique 'id'"`
	Email       string  `xorm:"text unique notnull 'email'"`
	Balance     float64 `xorm:"numeric(26,2) 'balance'"`
	HeldBalance float64 `xorm:"numeric(26,2) 'held_balance'"`
}
