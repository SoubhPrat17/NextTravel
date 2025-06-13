const HotelOffer = require('../models/HotelOffer');
const { fetchHotelSuggestions } = require('../services/fetchHotelSuggestions');
const { getHotelOffersByIds } = require('../services/getHotelOffersbyIds');
const { fetchFlightSuggestions } = require('../services/fetchFlightSuggestions');

exports.getSuggestions = async (req, res) => {
  try {
    const flightSuggestions = await fetchFlightSuggestions(req.body);
    const suggestions = await fetchHotelSuggestions(req.body);

    const hotelIds = suggestions.hotels.map(h => h.hotelId);
    const detailedOffers = await getHotelOffersByIds({
      hotelIds,
      accessToken: suggestions.accessToken,
      fromDate: suggestions.fromDate,
      toDate: suggestions.toDate,
      adults: suggestions.adults
    });

    if (detailedOffers.length > 0) {
      try {
        // await HotelOffer.insertMany(detailedOffers, { ordered: true });
        const bulkOps = detailedOffers.map(hotel => ({
          updateOne: {
            filter: { hotelId: hotel.hotelId },
            update: { $set: hotel },
            upsert: true
          }
        }));

        await HotelOffer.bulkWrite(bulkOps);
        console.log(`✅ Bulk upserted ${detailedOffers.length} hotel offer(s)`);

      } catch (insertErr) {
        console.error("❌ DB Insert failed:", insertErr.message);
        // Stop execution and send error to client
        return res.status(500).json({ error: "Failed to insert hotel offers", details: insertErr.message });
      }
    }

    res.json({
      destination: suggestions.destination,
      fromDate: suggestions.fromDate,
      toDate: suggestions.toDate,
      offers: detailedOffers,
    });
  } catch (error) {
    console.error("Error in getSuggestions:", error.message);
    res.status(500).json({ error: error.message });
  }
};
