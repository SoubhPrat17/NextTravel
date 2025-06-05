const axios = require('axios');

async function getHotelOffersByIds({ hotelIds, accessToken, fromDate, toDate, adults }) {
  const detailedOffers = [];

  console.log(`➡️ Fetching offers for ${hotelIds.length} hotel IDs...`);

  for (const hotelId of hotelIds) {
    try {
      const response = await axios.get('https://test.api.amadeus.com/v3/shopping/hotel-offers', {
        params: {
          hotelIds: hotelId,
          checkInDate: fromDate,
          checkOutDate: toDate,
          adults,
          paymentPolicy: 'NONE'
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const data = response.data;

      if (data?.data?.length > 0) {
        console.log(`✅ Offers found for hotelId ${hotelId} (${data.data[0].hotel.name})`);
        detailedOffers.push({
          name: data.data[0].hotel.name,
          hotelId,
          latitude: data.data[0].hotel.latitude,
          longitude: data.data[0].hotel.longitude,
          fromDate,
          toDate,
          destination: data.data[0].hotel.cityCode,
          adults,
          offers: data.data
        });
      } else {
        console.log(`⚠️ No offers for hotelId ${hotelId}`);
      }

    } catch (err) {
      console.error(`❌ Error fetching offer for hotelId ${hotelId}:`, err.message);
    }
  }

  console.log(`📦 Total offers ready to push to DB: ${detailedOffers.length}`);

  return detailedOffers;
}

module.exports = { getHotelOffersByIds };
