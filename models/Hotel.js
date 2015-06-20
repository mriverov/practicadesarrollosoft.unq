var mongoose = require('mongoose');

var HotelSchema = new mongoose.Schema({
  name: String,
  address: String,
  telephone:String,
  longitude: Number,
  latitude: Number,
  icon: String,
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }
});

mongoose.model('Hotel', HotelSchema);

