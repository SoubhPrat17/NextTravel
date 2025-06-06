const axios = require('axios');
const { getAmadeusAccessToken } = require('../auth/amadeusAuth');
const HotelSuggestion = require('../models/HotelSuggestion');
const { getCityIATACode } = require('../utils/locationUtils');

const fetchTravelSuggestions = async ({ fromDate, toDate, source, destination, adults }) => {
  try {
    const accessToken = await getAmadeusAccessToken();

    const sourceCode = await getCityIATACode(source, accessToken);
    const destinationCode = await getCityIATACode(destination, accessToken);

    const hotelResponse = await axios.get(
      'https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city',
      {
        params: { cityCode: destinationCode, radius: 20 },
        headers: { Authorization: `Bearer ${accessToken}` }
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
