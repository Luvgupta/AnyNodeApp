var exports = {};

var log = require("../utilities/logger.js").log;

/*
Sample data - 
{
    "authKey": xxxxxx,
    "isAdmin": boolean,
    "canManageVechicles": boolean,
    "validity": date object
}
*/
var userCache = {};

exports.add = function (_k, _v) {
    userCache[_k] = _v;
};

exports.fetch = function (_k) {
    return userCache[_k];
}

exports.delete = function (_k) {
    delete userCache[_k];
}

exports.checkLoginSession = function (req) {
    for (var k in userCache) {
        if (userCache[k].authKey == req.get('Auth-Key') && userCache[k].validity > (new Date())) return true;
    }
    return false;
}

exports.getUser = function (_authKey) {
    for (var k in userCache) {
        if (userCache[k].authKey == _authKey) return k;
    }
    return null;
}


module.exports = exports;