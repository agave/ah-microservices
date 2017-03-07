package util

// Configuration defines all runtime variables
type Configuration struct {
	KafkaBrokers []string `yaml:"KafkaBrokers"`
	Topics       []string `yaml:"KafkaTopics"`
	GroupID      string   `yaml:"ConsumerGroupID"`
}

// Config is a Configuration instance with predefined defaults
var Config Configuration
