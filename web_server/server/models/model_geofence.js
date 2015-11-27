var mongoose = require('mongoose');
var crypto = require("crypto");

var config = require('../../config');
var log = require("../utilities/logger.js").log;

mongoose.connect(config.mongo.connectionUrl);

var db = mongoose.connection;

var geofenceSchema = mongoose.Schema({
    name: String,
    points: {
        type: {
            type: String,
            default: "polygon"
        },
        coordinates: Array
    },
    createdBy: String,
    cDate: {
        type: Date,
        default: Date.now
    },
    org: String,
    isActive: {
        type: Boolean,
        default: true
    },
    enforcedAt: {
        level: String,
        list: [String]
    },
    visibleAt: {
        level: String,
        list: [String]
    },
    esid: {
        type: String,
        default: ""
    }
});

exports.geofenceModel = mongoose.model('GeoFence', geofenceSchema);

module.exports = exports;