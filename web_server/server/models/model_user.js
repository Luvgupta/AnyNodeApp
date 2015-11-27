var mongoose = require('mongoose');
var crypto = require("crypto");

var config = require('../../config');
var log = require("../utilities/logger.js").log;

mongoose.connect(config.mongo.connectionUrl);

exports.error = true;

var db = mongoose.connection;
db.on('error', function (_e) {
    log("Error: Unable to connect to DB");
    log(_e);
});
db.once('open', function (_cb) {
    log("Connection to DB established");
    exports.error = false;
});

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    isAdmin: {
        type: Boolean,
        default: false
    },
    canManageDevices: {
        type: Boolean,
        default: false
    },
    canManageUsers: {
        type: Boolean,
        default: false
    },
    devices: [String],
    org: String,
    salt: {
        type: String,
        default: crypto.createHash('md5').update((new Date()).toISOString()).digest("hex")
    },
    cDate: {
        type: Date,
        default: Date.now
    },
    llDate: {
        type: Date,
        default: null
    }
}).pre('save', function (next) {
    var self = this;
    exports.userModel.find({
        username: this.username,
        org: this.org
    }, function (_e, _d) {
        if (_e) next(new Error("Unable to connect to DB."));
        else {
            if (_d.length == 0) {
                self.password = crypto.createHash('md5').update(self.password + self.salt).digest("hex");
                next();
            } else next(new Error(self.username + " already exists user the org " + self.org));
        }
    })
});

userSchema.methods.validatePassword = function (password) {
    return (this.password == crypto.createHash('md5').update(password + this.salt).digest("hex"))
}

exports.userModel = mongoose.model('User', userSchema);

module.exports = exports;