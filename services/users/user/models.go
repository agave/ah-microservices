package user

// Users model
type Users struct {
	ID          int32   `xorm:"serial autoincr pk notnull unique 'id'"`
	Email       string  `xorm:"text notnull 'email'"`
	Balance     float64 `xorm:"numeric(26,2)"`
	HeldBalance float64 `xorm:"numeric(26,2)"`
}
