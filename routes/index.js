var express = require('express');
var router = express.Router();

var apiRouter = require('./api');
router.use('/api', apiRouter);

const TokenService = require('../src/service/token_service');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', function (req, res, next) {
  TokenService.getSignature('http://token.neiguiyin.com/test').then(data => {
    res.render('scanqr', data);
  }).catch(err => {
    res.render('error', err)
  })
})

module.exports = router;
