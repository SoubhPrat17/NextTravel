package main

import (
	"fmt"
	"net/http"
	"server/fetcher"
	"server/models"
	"server/parser"
	"time"

	"github.com/gin-gonic/gin"
)

// handleError simplifies error handling for API responses.
func handleError(c *gin.Context, err error, status int) {
	c.JSON(status, gin.H{"error": err.Error()})
}

// main sets up and runs the Gin server for the travel MCP.
func main() {
	// Initialize Gin router
	r := gin.Default()

	// Endpoint to handle initial travel prompt
	r.POST("/api/travel", func(c *gin.Context) {
		var input struct {
			Prompt string `json:"prompt"`
		}
		if err := c.BindJSON(&input); err != nil {
			handleError(c, err, http.StatusBadRequest)
			return
		}

		// Parse the user prompt
		req, err := parser.ParsePrompt(input.Prompt)
		if err != nil {
			handleError(c, err, http.StatusBadRequest)
			return
		}

		// Fetch flight recommendations based on parsed input
		flights, err := fetcher.FetchFlights(req)
		if err != nil {
			handleError(c, err, http.StatusInternalServerError)
			return
		}

		// Wrap flights in a recommendation-like response
		response := gin.H{
			"flights":    flights,
			"buses":      []models.Bus{},      // Placeholder for future implementation
			"hotels":     []models.Hotel{},    // Placeholder for future implementation
			"activities": []models.Activity{}, // Placeholder for future implementation
		}
		c.JSON(http.StatusOK, response)
	})

	// Endpoint to handle refinement of results
	r.POST("/api/refine", func(c *gin.Context) {
		var input struct {
			Prompt   string `json:"prompt"`
			Previous gin.H  `json:"previous"`
		}
		if err := c.BindJSON(&input); err != nil {
			handleError(c, err, http.StatusBadRequest)
			return
		}

		// Parse refinement prompt
		filters, err := parser.ParseRefinePrompt(input.Prompt)
		if err != nil {
			handleError(c, err, http.StatusBadRequest)
			return
		}

		// Extract flights from previous response
		flights, ok := input.Previous["flights"].([]interface{})
		if !ok {
			handleError(c, fmt.Errorf("invalid or missing flights in previous response"), http.StatusBadRequest)
			return
		}

		// Convert interface slice back to models.Flight slice
		var flightSlice []models.Flight
		for _, f := range flights {
			flightMap, ok := f.(map[string]interface{})
			if !ok {
				continue
			}
			flight := models.Flight{
				Provider:  flightMap["airline"].(string),
				Price:     flightMap["price"].(float64),
				Departure: flightMap["departure"].(time.Time),
				Arrival:   flightMap["arrival"].(time.Time),
				Duration:  flightMap["duration"].(time.Duration),
				// Route:     flightMap["route"].(string),
			}
			flightSlice = append(flightSlice, flight)
		}

		// Placeholder: Basic flight refinement (e.g., price filter)
		var refinedFlights []models.Flight
		for _, flight := range flightSlice {
			// Example: Filter flights by price if prompt specifies "under $X"
			if priceFilter, ok := filters["maxPrice"].(float64); ok && flight.Price <= priceFilter {
				refinedFlights = append(refinedFlights, flight)
			} else if !ok {
				refinedFlights = append(refinedFlights, flight) // No filter, keep all
			}
		}

		// Wrap refined flights in response
		response := gin.H{
			"flights":    refinedFlights,
			"buses":      []models.Bus{},      // Placeholder for future implementation
			"hotels":     []models.Hotel{},    // Placeholder for future implementation
			"activities": []models.Activity{}, // Placeholder for future implementation
		}
		c.JSON(http.StatusOK, response)
	})

	// Start the server on port 8080
	r.Run(":8080")
}
