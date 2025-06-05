const mongoose = require('mongoose');
const {Schema} = mongoose;

const hotelOfferSchema = new mongoose.Schema({
    name: String,
    hotelId: String,
    latitude: Number,
    longitude: Number,
    address: String,
    city: String,
    state: String,
    country: String,
    fromDate: String,
    toDate: String,
    destination: String,
    adults: Number,
    offers: [
    {
      type: { type: String },
      hotel: {
        type: { type: String },
        hotelId: String,
        chainCode: String,
        dupeId: String,
        name: String,
        cityCode: String,
        latitude: Number,
        longitude: Number
      },
      available: Boolean,
      offers: [
        {
          id: String,
          checkInDate: String,
          checkOutDate: String,
          rateCode: String,
          rateFamilyEstimated: {
            type: new mongoose.Schema({
              code: String,
              type: String
            }, { _id: false })
          },
          room: {
            type: { type: String },
            typeEstimated: {
              category: String,
              beds: Number,
              bedType: String
            },
            description: {
              text: String,
              lang: String
            }
          },
          guests: {
            adults: Number
          },
          price: {
            currency: String,
            base: String,
            total: String,
            variations: {
              average: {
                base: String
              },
              changes: [
                {
                  startDate: String,
                  endDate: String,
                  total: String,
                  base: String // Optional, sometimes exists
                }
              ]
            },
            taxes: [{
              code: String,
              pricingFrequency: String,
              pricingMode: String,
              amount: String,
              currency: String,
              included: Boolean
            }]
          },
          policies: {
            cancellations: [
              {
                numberOfNights: Number,
                deadline: String,
                amount: String,
                policyType: String,
                description: {
                  text: String
                }
              }
            ],
            guarantee: {
              acceptedPayments: {
                creditCards: [String],
                methods: [String],
                creditCardPolicies: [
                  {
                    vendorCode: String
                  }
                ]
              }
            },
            paymentType: String,
            refundable: {
              cancellationRefund: String
            }
          },
          self: String,
          roomInformation: {
            description: String,
            type: String,
            typeEstimated: {
              bedType: String,
              beds: Number,
              category: String
            }
          }
        }
      ],
      self: String
    }
  ]
});

module.exports = mongoose.model('HotelOffer', hotelOfferSchema, 'hotelOffers');
