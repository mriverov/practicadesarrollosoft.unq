var mongoose = require('mongoose');

var TripSchema = new mongoose.Schema({
  name: String,
  description: String,
  date: { type: Date, default: Date.now }
});

mongoose.model('Trip', TripSchema);

