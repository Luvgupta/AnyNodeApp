exports = {};
var req = require('requestify');

var config = require('../../config');
var log = require("../utilities/logger.js").log;

var url = config.elasticsearch.url + "/";

exports.addVehicle = function (_d, _cb) {
    var _url = url + config.elasticsearch.mgmt.name + "/" + config.elasticsearch.mgmt.type.device;
    req.post(_url, _d).then(function (res) {
        log("Added new device into ES " + _d.vid + " (" + _d.registrationNumber + ")");
        _cb(null, JSON.parse(res.body)._id);
    }, function (e) {
        log("Error adding device to ES " + _d.vid + "(" + _d.registrationNumber + ")");
        _cb(true);
    });
}

exports.delete = function (_d, _cb) {
    log("Removing vehicle :: " + _d);
    var _url = url + config.elasticsearch.mgmt.name + "/" + config.elasticsearch.mgmt.type.device + "/" + _d;
    req.delete(_url).then(function (res) {
        _cb();
    }, function (_e) {
        _cb(true);
    });
}


exports.update = function (_d, _cb) {
    var _url = url + config.elasticsearch.mgmt.name + "/" + config.elasticsearch.mgmt.type.device + "/" + _d.id + "/_update";;
    delete _d.id
    req.post(_url, {
        doc: _d
    }).then(function (res) {
        _cb();
    }, function (err) {
        _cb(true);
    });
};

module.exports = exports;