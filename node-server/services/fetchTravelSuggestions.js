const axios = require('axios');
require('dotenv').config();
const HotelSuggestion = require('../models/HotelSuggestion');

const getCityIATACode = async (cityName, accessToken) => {
  try {
    const response = await axios.get(
      'https://test.api.amadeus.com/v1/reference-data/locations',
      {
        params: {
          keyword: cityName,
          subType: 'CITY'
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const cityCode = response.data.data[0]?.iataCode;
    if (!cityCode) {
      throw new Error(`IATA code not found for city: ${cityName}`);
    }
    return cityCode;
  } catch (err) {
    console.error(`Failed to fetch IATA code for city "${cityName}":`, err.response?.data || err.message);
    throw new Error(`Could not fetch IATA code for ${cityName}`);
  }
};

const fetchTravelSuggestions = async ({ fromDate, toDate, source, destination, adults }) => {
  try {
    // Step 1: Get Amadeus access token
    const authResponse = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AMADEUS_CLIENT_ID,
        client_secret: process.env.AMADEUS_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = authResponse.data.access_token;

    // Step 2: Convert city names to IATA codes
    const sourceCode = await getCityIATACode(source, accessToken);
    const destinationCode = await getCityIATACode(destination, accessToken);

    // Step 3: Get hotel list using IATA city code
    const hotelResponse = await axios.get(
      `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city`,
      {
        params: {
          cityCode: destinationCode,
          radius: 20
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );


    if (hotelResponse.data.data.length > 0) {
      const bulkOps = hotelResponse.data.data.map(hotel => ({
        updateOne: {
          filter: { hotelId: hotel.hotelId },
          update: { $set: hotel },
          upsert: true
        }
      }));

      await HotelSuggestion.bulkWrite(bulkOps);
      console.log(`Upserted ${bulkOps.length} hotel records`);
    }


    const hotels = hotelResponse.data.data.map(hotel => ({
      hotelId: hotel.hotelId,
      name: hotel.name,
      latitude: hotel.geoCode.latitude,
      longitude: hotel.geoCode.longitude
    }));


    return {
      accessToken,
      fromDate,
      toDate,
      source: sourceCode,
      destination: destinationCode,
      adults,
      hotels
    };

  } catch (error) {
    console.error('Error in fetchTravelSuggestions:', error.response?.data || error.message);
    throw new Error('Failed to fetch travel suggestions');
  }
};

module.exports = { fetchTravelSuggestions };
