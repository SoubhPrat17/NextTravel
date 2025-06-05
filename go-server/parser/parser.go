package parser

import (
	"regexp"
	"server/models"
	"strings"
	"time"
)

func ParsePrompt(prompt string) (models.TravelRequest, error) {
	req := models.TravelRequest{}

	// Simple regex-based parsing
	fromRe := regexp.MustCompile(`from\s+([A-Za-z\s]+)`)
	toRe := regexp.MustCompile(`to\s+([A-Za-z\s]+)`)
	dateRe := regexp.MustCompile(`(\w+\s+\d{1,2}-\d{1,2},\s+\d{4})`)

	if match := fromRe.FindStringSubmatch(prompt); len(match) > 1 {
		req.Source = strings.TrimSpace(match[1])
	}
	if match := toRe.FindStringSubmatch(prompt); len(match) > 1 {
		req.Destination = strings.TrimSpace(match[1])
	}
	if match := dateRe.FindStringSubmatch(prompt); len(match) > 1 {
		dates := strings.Split(match[1], "-")
		start, _ := time.Parse("January 2, 2006", strings.TrimSpace(dates[0])+", 2025")
		end, _ := time.Parse("January 2, 2006", strings.TrimSpace(dates[1])+", 2025")
		req.Dates = models.DateRange{Start: start, End: end}
	}
	// Extract activity (basic)
	if strings.Contains(prompt, "adventure") {
		req.Activity = "adventure"
	} else if strings.Contains(prompt, "relaxation") {
		req.Activity = "relaxation"
	}

	return req, nil
}
