var log = require("../utilities/logger.js").log;
var config = require('../../config');

var Redis = require('ioredis');

var cluster = new Redis(config.redis.url);

exports.set = function (_k, _v) {
    cluster.set(_k, _v);
    cluster.expire(_k, 31536000);
}

exports.get = function (_k, _cb) {
    cluster.get(_k, function (err, res) {
        if (err) _cb();
        else _cb(res);
    });
}

exports.remove = function(_k){
    cluster.del(_k);
}

exports.flushall = function(_k){
    cluster.flushall();
}

module.exports = exports;