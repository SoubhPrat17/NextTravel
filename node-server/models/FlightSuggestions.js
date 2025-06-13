const mongoose = require('mongoose');
const { Schema } = mongoose;

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
            at: String,
            terminal: String
          },
          arrival: {
            iataCode: String,
            at: String,
            terminal: String
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
    fees: Schema.Types.Mixed,
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
          brandedFareLabel: String,
          class: String,
          includedCheckedBags: {
            quantity: Number,
            weight: Number,
            weightUnit: String
          },
          includedCabinBags: {
            weight: Number,
            weightUnit: String
          },
          amenities: [
            {
              description: String,
              isChargeable: Boolean,
              amenityType: String,
              amenityProvider: {
                name: String
              }
            }
          ]
        }
      ]
    }
  ]
}, { strict: false });


module.exports = mongoose.model('Flight', flightSuggestionSchema, 'flightSuggestions');
