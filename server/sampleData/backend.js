var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var bUtils = require('../sampleData/backend_utils');
var mongo = require('./backend_mongo');
var cache = require("../utilities/redis.js");

router.get('/r', function (req, res, next) {
    bUtils.cleanDB(function () {
        res.status(200).send("DB Reset \t\t [DONE]\n")
    });
    mongo.cleanDB(function () {});
    cache.flushall();
});

router.get('/i', function (req, res, next) {
    bUtils.initDB(function () {
        res.status(200).send("DB Initialize \t\t [DONE]\n");
    });
    mongo.initDB(function () {});
});

router.get('/p', function (req, res, next) {
    mongo.populate(function (_e) {
        if(_e) res.status(400).end("DB Populated \t [ERROR]\n");
        else res.end("DB Populated \t\t [DONE]\n");
    });
});

router.get('/m', function (req, res, next) {
    var i = 0;
    console.log(crypto.createHash('md5').update("password").digest("hex"));
    res.end();
});

module.exports = router;