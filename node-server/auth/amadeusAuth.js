const axios = require('axios');
require('dotenv').config();

let cachedToken = null;
let tokenExpiry = null;

const getAmadeusAccessToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60 * 1000) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AMADEUS_CLIENT_ID,
        client_secret: process.env.AMADEUS_CLIENT_SECRET
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in || 1800) * 1000;

    return cachedToken;
  } catch (error) {
    console.error('Failed to fetch Amadeus token:', error.response?.data || error.message);
    throw new Error('Could not get Amadeus access token');
  }
};

module.exports = { getAmadeusAccessToken };
