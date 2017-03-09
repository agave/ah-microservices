package util

// DBOptions holds database connection details
type DBOptions struct {
	Host     string   `yaml:"DBHost"`
	Port     int      `yaml:"DBPort"`
	DBName   string   `yaml:"DBName"`
	Username string   `yaml:"DBUser"`
	Password string   `yaml:"DBPassword"`
	Options  []string `yaml:"DBOptions"`
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
