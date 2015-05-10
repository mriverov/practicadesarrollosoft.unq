var mongoose = require('mongoose');

var CitySchema = new mongoose.Schema({
  address: String,
  longitude: Number,
  latitude: Number,
  icon: String,
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }
  
});

mongoose.model('City', CitySchema);

