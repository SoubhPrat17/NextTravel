const axios = require('axios');
const { getAmadeusAccessToken } = require('../auth/amadeusAuth');
const { getCityIATACode } = require('../utils/locationUtils');
const FlightSuggestions = require('../models/FlightSuggestions');

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

        const flightData = flightListResponse.data.data;

        if (!Array.isArray(flightData) || flightData.length === 0) {
            console.warn(`No flight data received for ${source} → ${destination}`);
            return [];
        }

        // Save to MongoDB
        await FlightSuggestions.insertMany(flightData, { ordered: true });
        console.log(`✅ Inserted ${flightData.length} flight records for ${sourceIATA} → ${destinationIATA}`);

        return flightData;
    } catch (error) {
        console.error("❌ Couldn't fetch or save flights:", error.response?.data || error.message);
        throw new Error("Flight fetching or saving failed");
    }
};

module.exports = { fetchFlightSuggestions };
