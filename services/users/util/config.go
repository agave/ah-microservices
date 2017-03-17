package util

// DBOptions holds database connection details
type DBOptions struct {
	Host     string   `yaml:"Host"`
	Port     int      `yaml:"Port"`
	DBName   string   `yaml:"Name"`
	Username string   `yaml:"User"`
	Password string   `yaml:"Password"`
	Options  []string `yaml:"Options"`
}

// Configuration defines all runtime variables
type Configuration struct {
	KafkaBrokers []string  `yaml:"KafkaBrokers"`
	Topics       []string  `yaml:"KafkaTopics"`
	GroupID      string    `yaml:"ConsumerGroupID"`
	DB           DBOptions `yaml:"DB"`
	Port         int       `yaml:"Port"`
}

// Config is a Configuration instance with predefined defaults
var Config Configuration
