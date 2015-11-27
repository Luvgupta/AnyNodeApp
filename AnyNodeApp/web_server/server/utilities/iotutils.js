var exports = {};
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var utils = require('./general');
var ad = require('../sampleData/db_insert_vals');

var dbObject;
var url = "mongodb://localhost:27017/CloudPlatform_1";

MongoClient.connect(url).then(function (db) {
    dbObject = db;
});

exports.processTelemetry = function (vid, telemetry, callback) {
    var t = {};
    t = telemetry;
    if(!t.hasOwnProperty('time')){
        t.time = new Date();
    }
    t.Geo = {
        "type": "point"
    };
    t.Geo.coordinates = [telemetry.coordinates[0], telemetry.coordinates[1]];
    delete t.coordinates;

    dbObject.collection(utils.telemetryCollection(vid)).insertOne(t, function (err, result) {
        callback(t);
    });
};

exports.processAlert = function(alertJSON, callback){
	var alert = {
		category: alertJSON.category,
		message: alertJSON.message
	};
	dbObject.collection("truck_details").findOne({ 'registrationNumber': alertJSON.vid }, function (err, vDetails) {
		if (vDetails != null) {
			console.log("Found Vehicle : " + JSON.stringify(vDetails));
			alert.vehicle = vDetails;
            alert.vehicle.telemetry = alertJSON.telemetry;
            if(!alert.vehicle.telemetry.hasOwnProperty('time')) {
                alert.vehicle.telemetry.time = new Date();
            }
            alert.isRead = false;
			dbObject.collection("alerts").insertOne(alert, function (err, result) {
				callback(alert);
			});
		} else {
			console.log("Cannot Find Vehcile : " + alertJSON.vid);
		}
		//callback(alert);
	});
}

module.exports = exports;
