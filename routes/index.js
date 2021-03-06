var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use(require('./users.js'));
router.use(require('./trips.js'));
router.use(require('./cities.js'));

module.exports = router;