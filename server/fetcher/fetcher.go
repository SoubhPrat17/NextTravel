package fetcher

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"server/models"
	"strconv"
	"time"
)

// AmadeusConfig holds the configuration for Amadeus API access.
type AmadeusConfig struct {
	ClientID     string
	ClientSecret string
	TokenURL     string
	BaseURL      string
	AccessToken  string
}

// AmadeusFlightResponse represents the structure of a flight search response from Amadeus.
type AmadeusFlightResponse struct {
	Data []struct {
		Type        string `json:"type"`
		ID          string `json:"id"`
		Itineraries []struct {
			Duration string `json:"duration"`
			Segments []struct {
				Departure struct {
					IataCode string `json:"iataCode"`
					At       string `json:"at"`
				} `json:"departure"`
				Arrival struct {
					IataCode string `json:"iataCode"`
					At       string `json:"at"`
				} `json:"arrival"`
			} `json:"segments"`
		} `json:"itineraries"`
		Price struct {
			Total string `json:"total"`
		} `json:"price"`
		Operating struct {
			CarrierCode string `json:"carrierCode"`
		} `json:"operating"`
	} `json:"data"`
}

// getAccessToken fetches an OAuth2 access token from Amadeus.
func (cfg *AmadeusConfig) getAccessToken() error {
	data := fmt.Sprintf("grant_type=client_credentials&client_id=%s&client_secret=%s",
		cfg.ClientID, cfg.ClientSecret)
	req, err := http.NewRequest("POST", cfg.TokenURL, bytes.NewBuffer([]byte(data)))
	if err != nil {
		return fmt.Errorf("failed to create token request: %v", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to fetch token: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("token request failed with status: %s", resp.Status)
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return fmt.Errorf("failed to decode token response: %v", err)
	}
	cfg.AccessToken = tokenResp.AccessToken
	return nil
}

// FetchFlights retrieves flight offers from Amadeus API based on the travel request.
func FetchFlights(req models.TravelRequest) ([]models.Flight, error) {
	// Validate the input request
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// Amadeus API configuration
	cfg := &AmadeusConfig{
		ClientID:     "J2nc5z53eoKeJoCrtoNJvAF9J578Ciuu", // Replace with your Amadeus Client ID
		ClientSecret: "zy5Ytos95rjH8Lvv",                 // Replace with your Amadeus Client Secret
		TokenURL:     "https://test.api.amadeus.com/v1/security/oauth2/token",
		BaseURL:      "https://test.api.amadeus.com/v2",
	}

	// Fetch access token
	if err := cfg.getAccessToken(); err != nil {
		return nil, fmt.Errorf("failed to get Amadeus token: %v", err)
	}

	// Build flight search URL
	flightURL := fmt.Sprintf("%s/shopping/flight-offers?originLocationCode=%s&destinationLocationCode=%s&departureDate=%s&adults=1&max=2",
		cfg.BaseURL, req.Source, req.Destination, req.Dates.Start.Format("2006-01-02"))

	// Create HTTP request for flight search
	flightReq, err := http.NewRequest("GET", flightURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create flight request: %v", err)
	}
	flightReq.Header.Set("Authorization", "Bearer "+cfg.AccessToken)

	// Execute flight search request
	client := &http.Client{}
	flightResp, err := client.Do(flightReq)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch flights: %v", err)
	}
	defer flightResp.Body.Close()

	if flightResp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("flight search failed with status: %s", flightResp.Status)
	}

	// Parse flight response
	var amadeusResp AmadeusFlightResponse
	if err := json.NewDecoder(flightResp.Body).Decode(&amadeusResp); err != nil {
		return nil, fmt.Errorf("failed to decode flight response: %v", err)
	}

	// Convert Amadeus flight data to our model
	var flights []models.Flight
	for _, offer := range amadeusResp.Data {
		departure, err := time.Parse("2006-01-02T15:04:05", offer.Itineraries[0].Segments[0].Departure.At)
		if err != nil {
			continue // Skip if date parsing fails
		}
		arrival, err := time.Parse("2006-01-02T15:04:05", offer.Itineraries[0].Segments[0].Arrival.At)
		if err != nil {
			continue // Skip if date parsing fails
		}
		duration, err := time.ParseDuration(offer.Itineraries[0].Duration)
		if err != nil {
			duration = 0 // Default to 0 if parsing fails
		}
		totalPrice, err := strconv.ParseFloat(offer.Price.Total, 64)
		if err != nil {
			continue // Skip if price parsing fails
		}
		flights = append(flights, models.Flight{
			Provider:  offer.Operating.CarrierCode,
			Price:     totalPrice,
			Departure: departure,
			Arrival:   arrival,
			Duration:  duration,
			// Route:     fmt.Sprintf("%s-%s", offer.Itineraries[0].Segments[0].Departure.IataCode, offer.Itineraries[0].Segments[0].Arrival.IataCode),
		})
	}

	// Return flights, or empty slice if none found
	return flights, nil
}
