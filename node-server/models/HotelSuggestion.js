const mongoose = require('mongoose');

const hotelSuggestionSchema = new mongoose.Schema({
  chainCode: String,
  iataCode: String,
  dupeId: Number,
  name: String,
  hotelId: String,
  geoCode: {
    latitude: Number,
    longitude: Number
  },
  address: {
    countryCode: String
  },
  distance: {
    value: Number,
    unit: String
  },
  lastUpdate: String // or use Date if you'd like: `lastUpdate: Date`
});

module.exports = mongoose.model('HotelSuggestion', hotelSuggestionSchema, 'hotelList');
