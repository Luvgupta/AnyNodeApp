exports = {};
var req = require('requestify');

var config = require('../../config');
var log = require("../utilities/logger.js").log;

var url = config.elasticsearch.url + "/";

exports.add = function (_u, _o, _m) {
    var data = {
        "username": _u,
        "org": _o,
        "date": new Date(),
        "log": _m
    };
    log(_m);
    var _url = url + config.elasticsearch.audit + "/audit";
    req.post(_url, data).then(function (res) {}, function (e) {
        log("Error adding audit log");
    });
}

exports.get = function (_username, _org, _offset, _cb) {
    log("Getting list of devices under org :: " + _org);
    var _url = url + config.elasticsearch.audit + "/audit/_search";
    var searchObj = {
        "from": _offset,
        "size": 20,
        "sort": {
            "date": {
                "order": "desc"
            }
        },
        "query": {
            "bool": {
                "must": [{
                    "match": {
                        "org": _org
                    }
                }],
                "must": [{
                    "match": {
                        "username": _username
                    }
                }]
            }
        }
    };
    req.post(_url, searchObj).then(function (res) {
        var _r = JSON.parse(res.body);
        if (_r.hits.total > 0) {
            var devices = _r.hits;
            _cb(null, devices);
        } else _cb(true);
    }, function (_e) {
        _cb(true);
    });
};


module.exports = exports;