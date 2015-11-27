var express = require('express');
var router = express.Router();
var requestify = require('requestify');
var config = require('../../config');
var log = require("../utilities/logger.js").log;
var cache = require("../utilities/cacheManager.js");
var model_device = require("../models/model_device");
var vehicles = require('../utilities/vehicle_db_es');
var mgmt_device = require("../mgmt/mgmt_device");
var audit = require("../mgmt/mgmt_audit");
var bp = require('body-parser');
var jsonParser = bp.json();

/*  POST /device/add
    Add a new vehicle.
*/
router.post('/add', jsonParser, function (req, res) {
    var _u = req.user;
    var device = req.body;
    if (_u.canManageDevices) {
        var new_device = new model_device.deviceModel.telemetry({
            vid: device.vid,
            registrationNumber: device.registrationNumber,
            make: device.make,
            permit: device.permit,
            modelYear: device.modelYear,
            type: device.type,
            org: device.org,
            isActive: true
        });
        new_device.save(function (_e, _d) {
            if (_e) {
                audit.add(_u.username, _u.org, "Error adding device " + device.vid + " (" + device.registrationNumber + ")");
                res.sendStatus(400);
            } else {
                audit.add(_u.username, _u.org, "New device " + device.vid + " (" + device.registrationNumber + ") added!");
                mgmt_device.addVehicle({
                    vid: _d.vid,
                    registrationNumber: _d.registrationNumber,
                    org: _d.org
                }, function (_e, _esid) {
                    if (_e) {
                        var m = "Error adding the device under ES" + device.vid + " (" + device.registrationNumber + ")";
                        audit.add(_u.username, _u.org, m);
                        res.sendStatus(400);
                    } else {
                        model_device.deviceModel.telemetry.where({
                            _id: _d._id
                        }).update({
                            esid: _esid
                        }, function (_e) {
                            if (_e) audit.add(_u.username, _u.org, "Unable to update ES_ID of " + device.vid + " (" + device.registrationNumber + ")");
                            else audit.add(_u.username, _u.org, "Updated ES_ID of " + device.vid + " (" + device.registrationNumber + ")");
                        });
                    }
                });
                res.end();
            }
        });
    } else res.status(400).send("Appi dei!, Enthonnu?");
});

/*  GET /device/delete?id=xxxx&vid=xxxx
    Remove a device
*/
router.get('/delete', function (req, res) {
    var _u = req.user;
    if (_u.canManageDevices) {
        model_device.deviceModel.telemetry.findOne({
            _id: req.query.id
        }, function (_e, _d) {
            if (_e) {
                audit.add(_u.username, _u.org, "Device " + req.query.id + " does not exist!");
                res.status(400).end("Yenthiro yentho!");
            } else {
                mgmt_device.delete(_d.esid, function (_e) {
                    if (_e) {
                        audit.add(_u.username, _u.org, "Unable to delete device " + _d.vid + "(" + _d.registrationNumber + ") from org " + _d.org);
                        res.status(400).end("Yenthiro yentho!");
                    } else {
                        model_device.deviceModel.telemetry.remove({
                            _id: _d._id
                        }, function (_e) {
                            if (_e) {
                                audit.add(_u.username, _u.org, "Error deleting device" + _d.vid + "(" + _d.registrationNumber + ") from org " + _d.org);
                                res.status(400).end("Yenthiro yentho!");
                            } else {
                                audit.add(_u.username, _u.org, "Deleted device" + _d.vid + "(" + _d.registrationNumber + ") from org " + _d.org);
                                res.end();
                            }
                        });
                    }
                });
            }
        });
    } else res.status(400).send("Appi dei!, Enthonnu?");
});


/*  GET /device/list
    Get list of all devices
*/
router.get('/list', function (req, res) {
    var _u = req.user;
    if (_u.canManageDevices) {
        model_device.deviceModel.telemetry.
        find({
            org: _u.org
        }).
        sort('vid').
        select('-esid -__v').
        exec(function (_e, _d) {
            if (_e) res.sendStatus(400);
            else {
                res.json(_d);
            }
        });
    } else res.status(400).send();
});

/*  GET /device/get?vid=xxxxx
    Get device info
*/
router.get('/get', function (req, res) {
    var _u = req.user;
    model_device.deviceModel.telemetry.findOne({
        vid: req.query.vid,
        org: _u.org
    }, function (_e, _d) {
        if (_e) res.sendStatus(400);
        else res.json(_d);
    });
});

/*  POST /device/update
    Update device info
*/
router.post('/update', jsonParser, function (req, res) {
    if (cache.checkLoginSession(req)) {
        var _u = cache.getUser(req.get('Auth-Key'));
        if (_u && cache.fetch(_u).canManageVehicle) {
            var device = req.body;
            device["org"] = cache.fetch(_u).org;
            mgmt_device.getDeviceDetails(device, function (_e, _d) {
                if (_e) {
                    audit.add(_u, cache.fetch(_u).org, "Error updating device " + device.vid);
                    log("ERROR trying to add device :: " + device.vid);
                    res.status(400).send();
                } else {
                    if (_d) {
                        mgmt_device.update(device, function (_e) {
                            if (_e) {
                                audit.add(_u, cache.fetch(_u).org, "Error updating device " + device.vid);
                                res.status(500).send();
                            } else {
                                audit.add(_u, cache.fetch(_u).org, "Updated the device " + device.vid);
                                res.status(200).send();
                            }
                        });
                    } else {
                        audit.add(_u, cache.fetch(_u).org, "Error updating device " + device.vid);
                        log("ERROR updaing device :: " + device.vid);
                        res.status(400).send();
                    }
                }
            });
        } else res.status(401).send("Appi dei, enthonithu?...");
    } else res.status(401).send("Appi dei, enthonithu?...");
});

/*  GET /device/location?vid=xxxxx
    Get last known location of a device
*/
router.get('/location', function (req, res) {
    var _u = req.user;
    if (req.query.vid) {
        vehicles.getCurrentLocation(req.query.vid, function (_err, _d) {
            if (_err) {
                res.sendStatus(400);
            } else {
                res.status(200).json(_d);
            }
        });
    } else res.sendStatus(400);
});

/*  Last 100 alerts  - GET /api/alert
    Vechile specific - GET /api/alert?id=xxxx
    Get all unread alerts.
*/
router.get('/alert', function (req, res) {
    if (req.query.hasOwnProperty("vid")) {
        vehicles.getAlertsForVehicle(req.query.vid, function (_e, _d) {
            if (_e) res.sendStatus(400);
            else res.status(200).send(_d);
        });
    } else {
        vehicles.getAlerts(function (_e, _d) {
            if (_e) res.sendStatus(400);
            else res.status(200).send(_d);
        });
    }
});

/*  PUT /api/alert?id=xxxxx
    Mark the alert as read.
*/
router.put('/alert', function (req, res, next) {
    if (req.query && req.query.hasOwnProperty("id")) {
        vehicles.ackAlert(req.query.id, function (_e) {
            if (_e) {
                log("Failed to mark alert " + req.query.id + " as read!");
                res.sendStatus(400);
            } else {
                res.status(200).send();
            }
        });
    } else res.sendStatus(400);
});

module.exports = router;