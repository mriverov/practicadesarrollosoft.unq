var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var Trip = mongoose.model('Trip');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

module.exports = router;

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
  //do nothing
  res.json(req.trip);

});

router.post('/trips/:trip/remove', function(req, res, next) {
  var query = Trip.findByIdAndRemove(req.trip);

  query.exec(function (err){
    if (err) { return next(err); }
    return next();
  });
});

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});