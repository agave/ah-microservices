package util

import (
	"fmt"
)

// FormatDBURL does just that
func FormatDBURL(protocol string, o *DBOptions) (url string) {
	url = fmt.Sprintf("%s://%s:%s@%s:%d/%s?",
		protocol,
		o.Username,
		o.Password,
		o.Host,
		o.Port,
		o.DBName)

	for _, opt := range o.Options {
		if opt != "" {
			url = fmt.Sprintf("%s%s&", url, opt)
		}
	}

	// trim last ampersand/question mark
	url = url[:len(url)-1]
	return
}
