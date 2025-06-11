const mongoose = require('mongoose');

const flightSuggestionSchema = new mongoose.Schema({
  type: String,
  id: String,
  source: String,
  instantTicketingRequired: Boolean,
  nonHomogeneous: Boolean,
  oneWay: Boolean,
  isUpsellOffer: Boolean,
  lastTicketingDate: String,
  lastTicketingDateTime: String,
  numberOfBookableSeats: Number,

  itineraries: [
    {
      duration: String,
      segments: [
        {
          departure: {
            iataCode: String,
            at: String
          },
          arrival: {
            iataCode: String,
            at: String
          },
          carrierCode: String,
          number: String,
          aircraft: {
            code: String
          },
          operating: {
            carrierCode: String
          },
          duration: String,
          id: String,
          numberOfStops: Number,
          blacklistedInEU: Boolean
        }
      ]
    }
  ],

  price: {
    currency: String,
    total: String,
    base: String,
    fees: [
      {
        amount: String,
        type: String
      }
    ],
    grandTotal: String
  },

  pricingOptions: {
    fareType: [String],
    includedCheckedBagsOnly: Boolean
  },

  validatingAirlineCodes: [String],

  travelerPricings: [
    {
      travelerId: String,
      fareOption: String,
      travelerType: String,
      price: {
        currency: String,
        total: String,
        base: String
      },
      fareDetailsBySegment: [
        {
          segmentId: String,
          cabin: String,
          fareBasis: String,
          brandedFare: String,
          class: String,
          includedCheckedBags: {
            quantity: Number
          }
        }
      ]
    }
  ]
});

module.exports = mongoose.model('Flight', flightSuggestionSchema, 'flightSuggestions');
