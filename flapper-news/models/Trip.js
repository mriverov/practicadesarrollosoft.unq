var mongoose = require('mongoose');

var TripSchema = new mongoose.Schema({
  name: String,
  description: String,
  dateOfDeparture: { type: Date},
  arrivalDate: { type: Date},
  date: { type: Date, default: Date.now },
  author: String,
  cities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }]
});

mongoose.model('Trip', TripSchema);

