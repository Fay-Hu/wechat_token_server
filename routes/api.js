var express = require('express');
var router = express.Router();
const ReqBody = require('../src/model/req_body')
const TokenService = require('../src/service/token_service');

router.get('/', function (req, res, next) {
    res.send('Hello, world!')
})

router.get('/access_token', function (req, res, next) {
    TokenService.getAccessToken().then(val => {
        res.send(new ReqBody(1, res));
    }).catch(err => {
        res.send(new ReqBody(0, null, err));
    })
})

module.exports = router;