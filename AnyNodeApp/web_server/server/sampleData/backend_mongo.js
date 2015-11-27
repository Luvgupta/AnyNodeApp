exports = {};

var mongoose = require('mongoose');
var req = require('requestify');
var crypto = require("crypto");
var insertionData = require('./db_insert_vals');
var config = require('../../config');
var log = require("../utilities/logger").log;
var model_user = require("../models/model_user");
var model_device = require("../models/model_device");
var model_geofence = require("../models/model_geofence");

var db = mongoose.connection;

exports.cleanDB = function (_cb) {
    log("Cleaning the DB " + config.mongo.collections.user);
    model_user.userModel.remove({}, function (_e) {
        if (_e) log(_e.message);
    });
    model_device.deviceModel.telemetry.remove({}, function (_e) {
        if (_e) log(_e.message);
    });
    model_geofence.geofenceModel.remove({}, function (_e) {
        if (_e) log(_e.message);
    });
    _cb();
}

exports.initDB = function (_cb) {
    log("Initializing the user collection with admin ids...");
    var usernames = ["admin", "admin"];
    var i = 0;
    while (i < usernames.length) {
        var admin = new model_user.userModel({
            username: usernames[i],
            password: "password",
            isAdmin: true,
            canManageUsers: true,
            canManageDevices: true,
            org: i == 0 ? "amaya" : "capiot",
            devices: ["13512345001", "13512345002", "13512345003", "13512345004", "13512345005", "13512345006", "13512345007"]
        });
        admin.save(function (_e) {
            if (_e) log(_e.message);
        });
        i++;
    }
    _cb();
};

exports.populate = function (_cb) {
    req.post("http://localhost/api/usr/login", {
        "username": "admin",
        "password": "password",
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);
        var usernames = ["abi", "jerry", "sandil", "vasu", "jayesh", "shyama", "luv", "ajit", "ashish"];
        var devices = ["13512345001", "13512345002", "13512345003", "13512345004", "13512345005", "13512345006", "13512345007"];
        var i = 0;
        while (i < usernames.length) {
            req.post("http://localhost/api/usr/add", {
                "username": usernames[i],
                "password": "password",
                "isAdmin": false,
                "canManageDevices": false,
                "canManageUsers": false,
                "devices": i % 2 == 0 ? devices.slice(0, 3) : devices.slice(3, 6)
            }, {
                headers: {
                    "Authorization": "JWT " + _r.token
                }
            }).then(function (res) {
                _cb();
            }, function (_e) {
                _cb("error");
            });
            i++;
        }

        insertionData.truckDetails.forEach(function (d) {
            d.org = "amaya";
            req.post("http://localhost/api/device/add", d, {
                headers: {
                    "Authorization": "JWT " + _r.token
                }
            }).then(function (res) {
            }, function (_e) {
                log(_e);
            });
        });
    }, function (err) {
        log(err);
        _cb("error");
    });
}

module.exports = exports;