var mongoose = require('mongoose');
var crypto = require("crypto");

var config = require('../../config');
var log = require("../utilities/logger.js").log;

mongoose.connect(config.mongo.connectionUrl);


var telemetrySchema = mongoose.Schema({
    vid: String,
    registrationNumber: String,
    make: String,
    permit: String,
    modelYear: String,
    type: String,
    org: String,
    cDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    esid: {
        type: String,
        default: ""
    }
});

exports.deviceModel = {
    telemetry: mongoose.model('Telemetry', telemetrySchema)
};

module.exports = exports;