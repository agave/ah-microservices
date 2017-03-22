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
	ID         string  `json:"id"`
	ProviderID string  `json:"provider_id"`
	InvestorID string  `json:"investor_id"`
	Amount     float64 `json:"amount"`
	Status     string  `json:"status"`
	CreatedAt  string  `json:"created_at"`
	UpdatedAt  string  `json:"updated_at"`
}

// Activity is used to produce event relevant to users
type Activity struct {
	InvoiceID string `json:"invoice_id"`
	UserID    string `json:"user_id"`
}
