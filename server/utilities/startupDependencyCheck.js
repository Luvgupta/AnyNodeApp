/*
Checking dependencies
*/
var req = require('requestify');
var config = require('../../config.js');

exports.doStartupDependencyCheck = function (callback) {
    req.get(config.elasticsearch.url).then(function (_res) {
        callback(true);
    }, function (_err) {
        callback(false, 'Unable to connect to ElasticSearch instance');
    });
}

module.exports = exports;