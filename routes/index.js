var express = require('express');
var router = express.Router();

var apiRouter = require('./api');
router.use('/api', apiRouter);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', function (req, res, next) {
  res.render('scanqr');
})

module.exports = router;
