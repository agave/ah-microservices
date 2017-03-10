package user

// Event defines a generic event interface
type Event struct {
	Type string `json:"type"`
	GUID string `json:"guid"`
	Body string `json:"body"`
	Key  string `json:"key"`
}

// InvoiceUpdated describes a kafka event produced by the invoices service
type InvoiceUpdated struct {
	ID         int64   `json:"id"`
	ProviderID int64   `json:"provider_id"`
	InvestorID int64   `json:"investor_id"`
	Amount     float64 `json:"amount"`
	Status     string  `json:"status"`
	CreatedAt  string  `json:"created_at"`
	UpdatedAt  string  `json:"updated_at"`
}

type UserActivity struct {
	InvoiceID int64 `json:"invoice_id"`
	UserID    int64 `json:"user_id"`
}
