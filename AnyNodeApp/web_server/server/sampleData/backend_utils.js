exports = {};

var req = require('requestify');
var crypto = require("crypto");
var insertionData = require('./db_insert_vals');
var config = require('../../config');
var log = require("../utilities/logger.js").log;

var elasticUrl = config.elasticsearch.url + "/";


exports.cleanDB = function (_cb) {
    log("Cleaning the Elasticsearch...");
    req.delete(elasticUrl + config.elasticsearch.alert);
    req.delete(elasticUrl + config.elasticsearch.index);
    req.delete(elasticUrl + config.elasticsearch.mgmt.name);
    req.delete(elasticUrl + config.elasticsearch.geofence.index);
    req.delete(elasticUrl + config.elasticsearch.audit);
    req.delete(elasticUrl + config.elasticsearch.viz);
    _cb();
};

exports.initDB = function (_cb) {
    log("Initializing the DB...");


    var bulkWrite = "";
    insertionData.es_data.forEach(function (truck) {
        var create = '{"index": {}}\n';
        create += JSON.stringify(truck) + "\n";
        bulkWrite += create;
    });

    req.put(elasticUrl + config.elasticsearch.alert).then(function (res) {
        log("Created Index :: " + config.elasticsearch.alert)
    });

    req.put(elasticUrl + config.elasticsearch.index).then(function (res) {
        log("Created Index :: " + config.elasticsearch.index)
    });

    req.put(elasticUrl + config.elasticsearch.audit).then(function (res) {
        log("Created Index :: " + config.elasticsearch.audit)
    });

    req.put(elasticUrl + config.elasticsearch.viz).then(function (res) {
        log("Created Index :: " + config.elasticsearch.viz)
    });

    req.put(elasticUrl + config.elasticsearch.geo).then(function (res) {
        log("Created Index :: " + config.elasticsearch.geo)
    });

    req.put(elasticUrl + config.elasticsearch.mgmt.name).then(function (res) {
        log("Created Index :: " + config.elasticsearch.mgmt.name)
    });
    
    req.put(elasticUrl + config.elasticsearch.geofence.index).then(function (res) {
        log("Created Index :: " + config.elasticsearch.geofence.index)
    });

    _cb();
};

module.exports = exports;