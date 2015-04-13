var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  name: String,
  description: String,
  date: { type: Date, default: Date.now }
});

mongoose.model('Post', PostSchema);

