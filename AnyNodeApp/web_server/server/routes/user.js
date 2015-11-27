var express = require('express');
var router = express.Router();
var requestify = require('requestify');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var log = require("../utilities/logger.js").log;
var cache = require("../utilities/redis.js");
var model = require("../models/model_user");

var audit = require("../mgmt/mgmt_audit");
var bp = require('body-parser');
var jsonParser = bp.json();
var socketArray;

module.exports = function (passport) {

    router.post('/login', jsonParser, function (req, res) {
        var user = req.body;
        if (user.username && user.org && user.password) {
            model.userModel.findOne({
                username: (user.username).toLocaleLowerCase(),
                org: (user.org).toLowerCase()
            }, function (err, _u) {
                if (err || !_u) res.status(400).end();
                else if (_u.validatePassword(user.password)) {
                    var token = jwt.sign(user, config.secret);
                    cache.set(token, JSON.stringify(user));
                    model.userModel.where({
                        _id: _u._id
                    }).update({
                        llDate: new Date()
                    }, function (_e, _d) {});
                    res.json({
                        token: token,
                        isAdmin: _u.isAdmin,
                        canManageDevices: _u.canManageDevices,
                        canManageUsers: _u.canManageUsers,
                        devices: _u.devices
                    });
                } else res.status(400).end();
            });
        } else res.status(400).end();
    });

    router.get('/logoff', function (req, res) {
        cache.remove(req.get("Authorization").split("JWT ")[1]);
        res.end();
    });

    router.post("/add", jsonParser, passport.authenticate('jwt', {
        session: false
    }), function (req, res) {
        var _u = req.user;
        var userData = req.body;
        if (_u.canManageUsers) {
            var new_user = new model.userModel({
                username: userData.username,
                password: userData.password,
                isAdmin: userData.isAdmin,
                canManageUsers: userData.canManageUsers,
                canManageDevices: userData.canManageDevices,
                org: (_u.org).toLowerCase(),
                devices: userData.devices
            });
            new_user.save(function (_e) {
                if (_e) {
                    audit.add(_u.username, _u.org, "Error adding user " + userData.username + " under org " + _u.org);
                    res.status(400).end();
                } else {
                    audit.add(_u.username, _u.org, "New user " + userData.username + " added under org " + _u.org);
                    res.end();
                }
            });
        } else res.status(400).send("Unable to add user " + userData.username);
    });

    router.get('/list', passport.authenticate('jwt', {
        session: false
    }), function (req, res, next) {
        var _u = req.user;
        if (_u.canManageUsers) {
            model.userModel.
            find({
                org: _u.org
            }).
            sort("username").
            select('-password -__v -salt').
            exec(function (_e, _d) {
                if (_e) res.sendStatus(400);
                else {
                    res.json(_d);
                }
            });
        } else res.status(400).send("Appi dei, enthonithu?...");
    });


    router.get('/delete', passport.authenticate('jwt', {
        session: false
    }), function (req, res, next) {
        var _u = req.user;
        if (_u.canManageUsers) {
            model.userModel.remove({
                username: req.query.username,
                org: (_u.org).toLowerCase()
            }, function (_e) {
                if (_e) {
                    audit.add(_u.username, _u.org, "Error deleting " + req.query.username);
                    log(_e.message);
                    res.status(400).end();
                } else {
                    audit.add(_u.username, _u.org, "Deleted " + req.query.username);
                    res.end();
                }
            });
        } else res.status(400).send("Appi dei, enthonithu?...");
    });

    /*  API: /usr/update
     */
    router.post('/update', jsonParser, passport.authenticate('jwt', {
        session: false
    }), function (req, res, next) {
        var _u = req.user;
        var userData = req.body;
        log(userData);
        if (_u.canManageUsers) {
            model.userModel.where({
                _id: userData._id
            }).update(userData, function (_e) {
                if (_e) {
                    audit.add(_u.username, _u.org, "Error updating user " + userData.username);
                    res.status(400).send("Unable to update user details");
                } else {
                    audit.add(_u.username, _u.org, "Updated user details for user " + userData.username);
                    res.end();
                }
            });
        } else res.status(401).send("oh! what ?");
    });

    return router;
}