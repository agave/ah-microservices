package util

//Configuration holds all values relevant to this app and its functions
type Configuration struct {
	Port        int    `yaml:"Port"`
	AGPort      int    `yaml:"apigatewayPort"`
	AGHost      string `yaml:"apigatewayHost"`
	SwaggerPath string `yaml:"swaggerPath"`
}

// Config is a global obj to be used throughout the connector
var Config Configuration
