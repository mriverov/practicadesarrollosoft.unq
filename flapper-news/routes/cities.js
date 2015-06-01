/**
 * Created by erica on 31/05/15.
 */

var express = require('express');
var mongoose = require('mongoose');
var jwt = require('express-jwt');

var router = express.Router();
var City = mongoose.model('City');
var Hotel = mongoose.model('Hotel');
var PointOfInterest = mongoose.model('PointOfInterest');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

// **************  Hotel ***************** //
router.param('city', function(req, res, next, id) {
    var query = City.findById(id);

    query.exec(function (err, city){
        if (err) { return next(err); }
        if (!city) { return next(new Error('can\'t find city')); }

        req.city = city;
        return next();
    });
});

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

// ************** Point of interest ***************** //

router.param('point', function(req, res, next, id) {
    var query = PointOfInterest.findById(id);
    query.exec(function (err, point){
        if (err) { return next(err); }
        if (!point) { return next(new Error('can\'t find the point of interest')); }

        req.point = point;
        return next();
    });
});


router.post('/city/:city/point', auth, function(req, res, next) {
    var point = new PointOfInterest(req.body);
    point.city = req.city;

    point.save(function(err, point){
        if(err){ return next(err); }

        req.city.points.push(point);
        req.city.save(function(err, city) {
            if(err){ return next(err); }

            res.json(point);
        });
    });
});

router.get('/city/:city/point/:point', function(req, res, next) {
    res.json(req.point);
});

router.post('/city/:city/point/:point/remove', function(req, res, next) {
    var query = PointOfInterest.findByIdAndRemove(req.point);

    query.exec(function (err){
        if (err) { return next(err); }
        return next();
    });
});

module.exports = router;