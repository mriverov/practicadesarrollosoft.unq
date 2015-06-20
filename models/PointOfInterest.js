/**
 * Created by erica on 31/05/15.
 */

var mongoose = require('mongoose');

var PointOfInterestSchema = new mongoose.Schema({
    name: String,
    address: String,
    longitude: Number,
    latitude: Number,
    icon: String,
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }
});

mongoose.model('PointOfInterest', PointOfInterestSchema);