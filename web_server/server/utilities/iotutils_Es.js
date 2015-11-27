var exports = {};
var utils = require('./general');
var req = require('requestify');
var url = "http://localhost:9200/apisupport/";


exports.processTelemetry = function(vid, telemetry, callback) {
    var t = {};
    t = telemetry;
    if (!t.hasOwnProperty('time')) {
        t.time = new Date();
    }
    t.Geo = {
        "type": "point"
    };
    t.Geo.coordinates = [telemetry.coordinates[0], telemetry.coordinates[1]];
    delete t.coordinates;

    req.post(url + utils.telemetryCollection(vid), t).then(function(response) {
        //console.info(JSON.stringify(response.getBody()));
        var telmInfo = {};
        telmInfo.vid = vid;
        telmInfo.telemetry = t;
        callback(telmInfo);
    }, function(err) {
        console.info("Error Posting Telemetry" + err.message);
        callback(null);
    });
};


exports.processAlert = function(alertJSON, callback) {
    var alert = {
        category: alertJSON.category,
        message: alertJSON.message
    };
    var promise = new Promise(function(resolved, rejected) {
        req.request(url + "truck_details/_search", {
            method: 'GET',
            body: {
                query: {
                    match: {
                        registrationNumber: alertJSON.vid
                    }
                }
            },
            dataType: 'json'
        }).then(function(res) {
            var response = res.getBody();
            if (response.hits.total > 0) {
                response = response.hits.hits[0]._source;
                alert.vehicle = vDetails;
                alert.vehicle.telemetry = alertJSON.telemetry;
                if (!alert.vehicle.telemetry.hasOwnProperty('time')) {
                    alert.vehicle.telemetry.time = new Date();
                }
                alert.isRead = false;
                resolved(alert);
            } else {
                console.error("Cannot find this vehicle : " + alertJSON.vid);
                callback(null);
            }
        }, function(err) {
            console.error("Error Getting Vehicle details : " + err.message);
            rejected(err);
        });
    });
    promise.then(function(alert) {
        req.post(url + "alerts", alert).then(function(res) {
            var alertResp = res.getBody();
            alert._id = alertResp._id;
            callback(alert);
        }, function(err) {
            console.error(err.message);

            callback(null);
        });
    }, function(err) {
        console.error(err.message);
        callback(null);
    });
};
module.exports = exports;