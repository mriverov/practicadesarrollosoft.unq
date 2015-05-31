var mongoose = require('mongoose');

var CitySchema = new mongoose.Schema({
  address: String,
  longitude: Number,
  latitude: Number,
  icon: String,
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }]
  
});

mongoose.model('City', CitySchema);

