var express = require('express');
var router = express.Router();
const ReqBody = require('../src/model/req_body')
const TokenService = require('../src/service/token_service');

router.get('/', function (req, res, next) {
    res.send('Hello, world!')
})

router.get('/access_token', function (req, res, next) {
    let { force } = req.query;
    if (force) {
        if (force === "0") force = false;
        else if (force === "false") force = false;
    }
    console.log('[/access_token] force=%o', force);
    TokenService.getAccessToken(force).then(val => {
        res.send(new ReqBody(1, val));
    }).catch(err => {
        res.send(new ReqBody(0, null, err));
    })
})

router.get('/jsapi_ticket', function (req, res, next) {
    let { force } = req.query;
    if (force) {
        if (force === "0") force = false;
        else if (force === "false") force = false;
    }
    console.log('[/jsapi_ticket] force=%o', force);
    TokenService.getJSApiTicket(force).then(val => {
        res.send(new ReqBody(1, val));
    }).catch(err => {
        res.send(new ReqBody(0, null, err));
    })
})

router.post('/signature', function (req, res, next) {
    let { url } = req.body;
    console.log('[/signature] url = %o', url);
    if (!url || !url.trim()) {
        res.send(new ReqBody(0, null, 'param url is empty'))
        return;
    }
    TokenService.getSignature(url).then(val => {
        res.send(new ReqBody(1, val));
    }).catch(err => {
        res.send(new ReqBody(0, null, err));
    })
})

module.exports = router;