var config = require('../../config');
var colors = require('colors');
var log = require('util').log;

var logger = {};

function getDateTime(incomingDate) {
    if (typeof incomingDate != "undefined") {
        var sd = incomingDate;
        var syear = sd.getFullYear();
        var smonth = ("0" + (sd.getMonth() + 1)).slice(-2);
        var sdate = ("0" + sd.getDate()).slice(-2);
        var shours = ("0" + sd.getHours()).slice(-2);
        var sminutes = ("0" + sd.getMinutes()).slice(-2);
        var startDate = syear + "-" + smonth + "-" + sdate;
        var startTime = shours + ":" + sminutes;
        return startDate + " " + startTime;
    }
    return "";
}

logger.log = function (_s) {
    if (typeof _s == 'string')
        log(colors.white("[" + config.name + "] - ") + _s);
    else
        log(colors.white("[" + config.name + "] - ") + JSON.stringify(_s));
}

module.exports = logger;