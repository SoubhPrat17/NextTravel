package models

import (
	"fmt"
	"time"
)

type TravelRequest struct {
	Source      string    `json:"source"`
	Destination string    `json:"destination"`
	Dates       DateRange `json:"dates"`
	Activity    string    `json:"activity"`
}

// Validate checks if the travel request is valid.
func (tr TravelRequest) Validate() error {
	if tr.Source == "" || tr.Destination == "" {
		return fmt.Errorf("source and destination cannot be empty")
	}
	if err := tr.Dates.Validate(); err != nil {
		return err
	}
	return nil
}

type DateRange struct {
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}

func (dr DateRange) Validate() error {
	if dr.End.Before(dr.Start) {
		return fmt.Errorf("end date %v is before start date %v", dr.End, dr.Start)
	}
	return nil
}

type Recommendation struct {
	Flights    []Flight   `json:"flights"`
	Buses      []Bus      `json:"buses"`
	Hotels     []Hotel    `json:"hotels"`
	Activities []Activity `json:"activities"`
}

type Flight struct {
	Provider  string        `json:"provider"`
	Price     float64       `json:"price"`
	Departure time.Time     `json:"departure"`
	Arrival   time.Time     `json:"arrival"`
	Duration  time.Duration `json:"duration"`
}

type Bus struct {
	Provider  string        `json:"provider"`
	Price     float64       `json:"price"`
	Departure time.Time     `json:"departure"`
	Arrival   time.Time     `json:"arrival"`
	Duration  time.Duration `json:"duration"`
	Route     string        `json:"route"`
}

type Hotel struct {
	Provider     string    `json:"provider"`
	Price        float64   `json:"price"`
	Location     string    `json:"location"`
	Amenities    []string  `json:"amenities"`
	CheckInDate  time.Time `json:"checkInDate"`
	CheckOutDate time.Time `json:"checkOutDate"`
}

type Activity struct {
	Provider    string  `json:"provider"`
	Price       float64 `json:"price"`
	Location    string  `json:"location"`
	Type        string  `json:"type"`
	Duration    string  `json:"duration"`
	Description string  `json:"description"`
}
