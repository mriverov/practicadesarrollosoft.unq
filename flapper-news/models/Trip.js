var mongoose = require('mongoose');

var TripSchema = new mongoose.Schema({
  name: String,
  description: String,
  dateOfDeparture: { type: Date},
  arrivalDate: { type: Date},
  date: { type: Date, default: Date.now },
  author: String,
});

mongoose.model('Trip', TripSchema);

