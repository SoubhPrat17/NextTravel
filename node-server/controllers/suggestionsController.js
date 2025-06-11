const HotelOffer = require('../models/HotelOffer');
const { fetchTravelSuggestions } = require('../services/fetchTravelSuggestions');
const { getHotelOffersByIds } = require('../services/getHotelOffersbyIds');
const {fetchFlightSuggestions} = require('../services/fetchFlightSuggestions');

exports.getSuggestions = async (req, res) => {
  try {
    const flightSuggestions = await fetchFlightSuggestions(req.body);
    const suggestions = await fetchTravelSuggestions(req.body);

    const hotelIds = suggestions.hotels.map(h => h.hotelId);
    const detailedOffers = await getHotelOffersByIds({
      hotelIds,
      accessToken: suggestions.accessToken,
      fromDate: suggestions.fromDate,
      toDate: suggestions.toDate,
      adults: suggestions.adults
    });

    detailedOffers.forEach(offer => { offer.offers.forEach(o => {
        // Ensure roomInformation is an object with correct subfields
        if (typeof o.roomInformation !== 'object' || Array.isArray(o.roomInformation)) {
          o.roomInformation = {
            description: '',
            type: '',
            typeEstimated: {
              bedType: '',
              beds: 0,
              category: ''
            }
          };
        } else {
          // Provide defaults for missing nested values
          o.roomInformation.description ||= '';
          o.roomInformation.type ||= '';
          o.roomInformation.typeEstimated ||= {};
          o.roomInformation.typeEstimated.bedType ||= '';
          o.roomInformation.typeEstimated.beds ||= 0;
          o.roomInformation.typeEstimated.category ||= '';
        }
      });
    });


    if (detailedOffers.length > 0) {
      try {
        await HotelOffer.insertMany(detailedOffers, { ordered: true }); // fails fast if one fails
        console.log(`[${new Date().toISOString()}] ✅ Inserted ${detailedOffers.length} hotel offer(s) for destination ${detailedOffers[0]?.destination || 'N/A'}`);
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
      offers: detailedOffers
    });
  } catch (error) {
    console.error("Error in getSuggestions:", error.message);
    res.status(500).json({ error: error.message });
  }
};
