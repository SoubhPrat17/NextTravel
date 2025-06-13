const axios = require('axios');
const { getAmadeusAccessToken } = require('../auth/amadeusAuth');
const { getCityIATACode } = require('../utils/locationUtils');
const Flight = require('../models/FlightSuggestions');

const fetchFlightSuggestions = async ({ fromDate, toDate, source, destination, adults }) => {
    try {
        const accessToken = await getAmadeusAccessToken();

        const sourceIATA = await getCityIATACode(source, accessToken);
        const destinationIATA = await getCityIATACode(destination, accessToken);

        const flightListResponse = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
            params: {
                originLocationCode: sourceIATA,
                destinationLocationCode: destinationIATA,
                departureDate: fromDate,
                returnDate: toDate,
                adults,
                currencyCode: 'INR',
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });


        const flightOffers = flightListResponse.data.data;

        if (!Array.isArray(flightOffers) || flightOffers.length === 0) {
            console.warn(`No flight data received for ${source} → ${destination}`);
            return [];
        }

        // Save to MongoDB using upsert (no duplicates)
        for (const flight of flightOffers) {
            try {
                await Flight.updateOne(
                    { id: flight.id },
                    { $set: flight }, 
                    { upsert: true }
                );
            } catch (err) {
                console.warn(`⚠️ Failed to upsert flight with ID ${flight.id}:`, err.message);
            }
        }

        console.log(`✅ Upserted ${flightOffers.length} flight records for ${sourceIATA} → ${destinationIATA}`);

        return flightOffers;
    } catch (error) {
        console.error("❌ Couldn't fetch or save flights:", error.response?.data || error.message);
        throw new Error("Flight fetching or saving failed");
    }
};

module.exports = { fetchFlightSuggestions };
