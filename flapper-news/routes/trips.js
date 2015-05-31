/**
 * Created by erica on 10/05/15.
 */
var express = require('express');
var mongoose = require('mongoose');
var jwt = require('express-jwt');

var router = express.Router();
var Trip = mongoose.model('Trip');
var City = mongoose.model('City');
var Hotel = mongoose.model('Hotel');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

router.get('/trips', auth, function(req, res, next) {
    Trip.find({ author: req.payload.username }, function(err, trips){
        if(err){ return next(err); }

        res.json(trips);
    });
});

router.post('/trips', auth, function(req, res, next) {
    var trip = new Trip(req.body);
    trip.author = req.payload.username;
    trip.date = Date.now();

    trip.save(function(err, trip){
        if(err){ return next(err); }
        res.json(trip);
    });
});

router.param('trip', function(req, res, next, id) {
    var query = Trip.findById(id);

    query.exec(function (err, trip){
        if (err) { return next(err); }
        if (!trip) { return next(new Error('can\'t find trip')); }

        req.trip = trip;
        return next();
    });
});

router.get('/trips/:trip', function(req, res, next) {
    req.trip.populate('cities', function(err, trip) {
        if (err) { return next(err); }
        res.json(trip);
    });
});

router.post('/trips/:trip/remove', function(req, res, next) {
    var query = Trip.findByIdAndRemove(req.trip);

    query.exec(function (err){
        if (err) { return next(err); }
        return next();
    });
});

router.param('city', function(req, res, next, id) {
    var query = City.findById(id);

    query.exec(function (err, city){
        if (err) { return next(err); }
        if (!city) { return next(new Error('can\'t find city')); }

        req.city = city;
        return next();
    });
});

router.get('/trips/:trip/city/:city', function(req, res, next) {
     req.city.populate('hotels', function(err, city) {
        if (err) { return next(err); }
        res.json(city);
    });
});

router.post('/trips/:trip/cities', auth, function(req, res, next) {
    var city = new City(req.body);
    city.trip = req.trip;

    city.save(function(err, city){
        if(err){ return next(err); }

        req.trip.cities.push(city);
        req.trip.save(function(err, trip) {
            if(err){ return next(err); }

            res.json(city);
        });
    });
});

router.post('/trips/:trip/cities/:city/remove', function(req, res, next) {
    var query = City.findByIdAndRemove(req.city);

    query.exec(function (err){
        if (err) { return next(err); }
        return next();
    });
});

// **************  Hotel ***************** //
router.param('hotel', function(req, res, next, id) {
    var query = Hotel.findById(id);

    query.exec(function (err, hotel){
        if (err) { return next(err); }
        if (!hotel) { return next(new Error('can\'t find hotel')); }

        req.hotel = hotel;
        return next();
    });
});


router.post('/city/:city/hotel', auth, function(req, res, next) {
    var hotel = new Hotel(req.body);
    hotel.city = req.city;

    hotel.save(function(err, hotel){
        if(err){ return next(err); }

        req.city.hotels.push(hotel);
        req.city.save(function(err, city) {
            if(err){ return next(err); }

            res.json(hotel);
        });
    });
});

router.get('/city/:city/hotel/:hotel', function(req, res, next) {
     res.json(req.hotel);
});

router.post('/city/:city/hotel/:hotel/remove', function(req, res, next) {
    var query = Hotel.findByIdAndRemove(req.hotel);

    query.exec(function (err){
        if (err) { return next(err); }
        return next();
    });
});

module.exports = router;