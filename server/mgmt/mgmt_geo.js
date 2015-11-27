exports = {};

var req = require('requestify');

var config = require('../../config');
var log = require("../utilities/logger.js").log;

var url = config.elasticsearch.url + "/";


exports.add = function (_d, _cb) {
    var _url = url + config.elasticsearch.geofence.index + "/" + config.elasticsearch.geofence.type;
    req.post(_url, _d).then(function (res) {
        _cb(null, JSON.parse(res.body)._id);
    }, function (e) {
        _cb(true);
    });
}

exports.update = function (_data, _cb) {
    var _url = url + config.elasticsearch.geofence.index + "/" + config.elasticsearch.geofence.type + "/" + _data.esid + "/_update";
    var _d = JSON.parse(JSON.stringify(_data));
    delete _d.esid;
    req.post(_url, {
        doc: _d
    }).then(function (res) {
        _cb();
    }, function (err) {
        _cb(true);
    });
}

exports.delete = function (_d, _cb) {
    var _url = url + config.elasticsearch.geofence.index + "/" + config.elasticsearch.geofence.type + "/" + _d;
    req.delete(_url).then(function (res) {
        _cb();
    }, function (_e) {
        _cb(true);
    });
}


module.exports = exports;