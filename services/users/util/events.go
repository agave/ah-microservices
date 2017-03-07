package util

// Event defines a generic event interface
type Event interface {
	GetType() string
	GetID() string
	GetBody() string
}

// GenericEvent definition
type GenericEvent struct {
	Type string `json:"type"`
	ID   string `json:"guid"`
	Body string `json:"body"`
}

// GetType returns the Type variable from a GenericEvent struct
func (s *GenericEvent) GetType() string { return s.Type }

// GetID returns the ID variable from a GenericEvent struct
func (s *GenericEvent) GetID() string { return s.ID }

// GetBody returns the Body variable from a GenericEvent struct
func (s *GenericEvent) GetBody() string { return s.Body }
