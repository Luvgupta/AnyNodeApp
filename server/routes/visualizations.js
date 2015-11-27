var express = require('express');
var router = express.Router();
var requestify = require('requestify');
var config = require('../../config');
var log = require("../utilities/logger.js").log;
var cache = require("../utilities/cacheManager.js");
var esQuery = require("../utilities/vehicle_db_es");
var bp = require('body-parser');
var jsonParser = bp.json();
var deviceList = [];

/* API:
        /viz/distFuel?id=xxxx&st=<start_date>&et=<end_date>
*/
router.get('/distFuel', function (req, res) {
    var id = req.query.id;
    var st = req.query.st;
    var et = req.query.et;
    var offset = 0;
    var container = [];
    if (cache.checkLoginSession(req) && id && st && et) {
        fetchVizData(id, st, et, offset, container, function (_e, _d) {
            if (_e) res.status(500).send("Fail!");
            else {
                var data = [];
                var i = 0;
                while (i < _d.length) {
                    data.push(_d[i]._source);
                    i++;
                }
                res.end(JSON.stringify(data));
            }
        });
    } else {
        res.status(500).send("Failed Auth!");
    }
});

/*
    fetch all distance fuel data for the device
*/
function fetchVizData(_id, _st, _et, _offset, _c, _cb) {
    esQuery.getVizData(_id, _st, _et, _offset, function (_e, _d) {
        if (_e) _cb(true);
        else {
            _c.push.apply(_c, _d.hits);
            if (_offset < _d.total) {
                fetchVizData(_id, _st, _et, _offset + 200, _c, _cb)
            } else {
                _cb(null, _c);
            }
        }
    });
}

// todo remove this
router.get('/d', function (req, res) {
    var d1 = new Date();
    var d2 = new Date();
    //    d2.setMinutes(d1.getMinutes() - 15);
    d2.setDate(d1.getDate() - 1);
    log("Aggregation Start Date :: " + d2.toISOString());
    log("Aggregation End Date   :: " + d1.toISOString());
    var id = req.query.id;
    var st = d2;
    var et = d1;
    var offset = 0;
    var container = [];
    fetchVizData(id, st, et, offset, container, function (_e, _d) {
        if (_e) res.status(500).send("Fail!");
        else {
            var data = [];
            var i = 0;
            while (i < _d.length) {
                data.push(_d[i]._source);
                i++;
            }
            res.end(JSON.stringify(data));
        }
    });
});

// the interval for which aggregation queries would be run
var aggr_interval = config.elasticsearch.aggregationInterval * 60 * 1000;
setInterval(function () {
    log("Running aggregation queries...");
    runAggregation(function (_e, _d) {
        if (_e) {
            log("Failed to run aggregation queries...");
        } else {
            var et = new Date();
            var st = new Date();
            st.setMinutes(et.getMinutes() - config.elasticsearch.aggregationInterval);
            _d.forEach(function (d) {
                var container = [];
                fetchAllDataFromES(d, st, et, 0, container, function (_e, _d) {
                    if (_e) {
                        log("No aggregation done for the device " + d);
                    } else {
                        var filteredData = [];
                        var i = 0;
                        while (i < _d.length) {
                            filteredData.push({
                                vid: d,
                                time: _d[i].fields.time[0],
                                mile: _d[i].fields.mile[0],
                                oil: _d[i].fields.oil[0],
                            });
                            i++;
                        }
                        var aggr_data = processAndAggregate(filteredData);
                        esQuery.addVizData(aggr_data);
                    }
                });
            });
        }
    });
}, aggr_interval);

// start the aggrgation
// the call back would have the list of devices
// with in the call back we will run the aggregation for each of the devices
function runAggregation(_cb) {
    var deviceList = [];
    fetchAllDevices(0, deviceList, function (_e, _d) {
        if (_e) _cb(true);
        else {
            deviceList = [];
            var i = 0;
            while (i < _d.length) {
                deviceList.push(_d[i].fields.vid[0]);
                i++;
            }
            _cb(null, deviceList);
        }
    });
}

// fetch all the devices from ES, recursively
function fetchAllDevices(_offset, _c, _cb) {
    esQuery.getAllVehicles(_offset, function (_e, _d) {
        if (_e) _cb(true);
        else {
            _c.push.apply(_c, _d.hits);
            if (_offset < _d.total) {
                fetchAllDevices(_offset + 200, _c, _cb)
            } else {
                _cb(null, _c);
            }
        }
    });
}

function fetchAllDataFromES(_id, _st, _et, _offset, _c, _cb) {
    esQuery.getDistFuel(_id, _st, _et, _offset, function (_e, _d) {
        if (_e) _cb(true);
        else {
            _c.push.apply(_c, _d.hits);
            if (_offset < _d.total) {
                fetchAllDataFromES(_id, _st, _et, _offset + 200, _c, _cb)
            } else {
                _cb(null, _c);
            }
        }
    });
}

function processAndAggregate(_d) {
    var t_dist = _d[_d.length - 1].mile - _d[0].mile;
    var t_fuel = 0;

    var base_f = _d[0].oil;
    var prev_f = _d[0].oil;
    var processed = false;
    var i = 1;
    while (i < _d.length) {
        var curr_f = _d[i].oil;
        if (curr_f > prev_f) {
            t_fuel = t_fuel + (base_f - prev_f);
            base_f = prev_f = curr_f;
            if (i == (_d.length - 1)) {
                t_fuel = t_fuel + (base_f - curr_f);
                processed = true;
            }
        }
        if (i == (_d.length - 1) && !processed) {
            t_fuel = t_fuel + (base_f - curr_f);
            processed = true;
        }
        prev_f = curr_f;
        i++;
    }
    return ({
        "vid": _d[0].vid,
        "time": _d[0].time,
        "t_dist": t_dist,
        "t_fuel": t_fuel
    });
}

/*  API:
        /viz/telemetry?id=xxx&st<start_date>&et=<end_date>&offset=xxxx
*/
router.get('/telemetry', function (req, res, next) {
    var id = null;
    var startDate = null;
    var endDate = null;
    var offset = null;
    if (cache.checkLoginSession(req) && req.query.hasOwnProperty("id") && req.query.hasOwnProperty("st") && req.query.hasOwnProperty("et") && req.query.hasOwnProperty("offset")) {
        id = req.query.id;
        offset = req.query.offset;
        startDate = req.query.st;
        endDate = req.query.et;
        esQuery.getTelemetry(id, startDate, endDate, offset, function (_e, _d) {
            if (_e) res.status(500).send("Fail!");
            else res.status(200).send(_d);
        });
    } else res.status(400).send("Enthiridai?");
});

module.exports = router;