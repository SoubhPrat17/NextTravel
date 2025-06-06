const axios = require('axios');

/**
 * Fetches the IATA city code for a given city name using Amadeus API.
 * @param {string} cityName
 * @param {string} accessToken
 * @returns {Promise<string>} IATA code
 */
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

module.exports = { getCityIATACode };
