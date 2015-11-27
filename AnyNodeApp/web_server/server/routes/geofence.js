var express = require('express');
var router = express.Router();
var requestify = require('requestify');
var config = require('../../config');
var log = require("../utilities/logger.js").log;
var audit = require("../mgmt/mgmt_audit");

var mgmt_geo = require("../mgmt/mgmt_geo");
var gfmodel = require("../models/model_geofence");
var bp = require('body-parser');
var jsonParser = bp.json();

router.post('/create', jsonParser, function (req, res) {
    var _u = req.user;
    var d = req.body;
    var _points = [];
    var i = 0;
    while (i < d.points.length) {
        _points.push([d.points[i].lat, d.points[i].lng]);
        i++;
    }
    _points.push([d.points[0].lat, d.points[0].lng]);
    var fence = {
        name: d.name,
        points: {
            type: "polygon",
            coordinates: [_points]
        },
        createdBy: _u.username,
        org: _u.org,
        isActive: true,
        enforcedAt: {
            level: "org",
            list: [_u.org]
        },
        visibleAt: {
            level: "org",
            list: [_u.org]
        }
    };
    var new_gf = new gfmodel.geofenceModel(fence);
    gfmodel.geofenceModel.findOne({
        name: fence.name,
        org: fence.org
    }, function (_e, _d) {
        if (_d) {
            var m = "Error creating the geofence " + d.name + " under the org " + _u.org + ". Fence already exists.";
            audit.add(_u.username, _u.org, m);
            res.status(400).end(m);
        } else {
            new_gf.save(function (_e, _d) {
                if (_e) {
                    var m = "Error creating the geofence " + d.name + " under the org " + _u.org;
                    audit.add(_u.username, _u.org, m);
                    res.sendStatus(400);
                } else {
                    var m = "Created new geofence " + d.name + " under the org " + _u.org;
                    audit.add(_u.username, _u.org, m);
                    mgmt_geo.add(fence, function (_e, _esid) {
                        if (_e) {
                            var m = "Error creating the geofence under ES" + d.name + " under the org " + _u.org;
                            audit.add(_u.username, _u.org, m);
                            res.sendStatus(400);
                        } else {
                            gfmodel.geofenceModel.where({
                                _id: _d._id
                            }).update({
                                esid: _esid
                            }, function (_e) {
                                if (_e) audit.add(_u.username, _u.org, "Unable to update ES_ID of geo-fence " + _d.name + " (" + _d.org + ")");
                                else audit.add(_u.username, _u.org, "Updated ES_ID of geo-fence " + _d.name + " (" + _d.org + ")");
                            });
                            res.sendStatus(200);
                        }
                    });
                }
            });
        }
    });
});

router.post('/update', jsonParser, function (req, res) {
    var _u = req.user;
    var d = req.body;
    var _points = [];
    var i = 0;
    while (i < d.points.length) {
        _points.push([d.points[i].lat, d.points[i].lng]);
        i++;
    }
    _points.push([d.points[0].lat, d.points[0].lng]);
    var fence = {
        name: d.name,
        points: {
            type: "polygon",
            coordinates: [_points]
        },
    };
    gfmodel.geofenceModel.where({
        _id: d._id
    }).update(fence, function (_e, _d) {
        if (_e) {
            var m = "Error updateing the geofence " + d.name + " under the org " + _u.org;
            audit.add(_u.username, _u.org, m);
            res.sendStatus(400);
        } else {
            gfmodel.geofenceModel.findOne({
                _id: d._id
            }, function (_e, _fence) {
                var m = "Updated the geofence" + d.name + " under the org " + _u.org;
                audit.add(_u.username, _u.org, m);
                var _d = JSON.parse(JSON.stringify(_fence));
                delete _d.__v;
                delete _d._id;
                delete _d.cDate;
                mgmt_geo.update(_d, function (_e) {
                    if (_e) {
                        var m = "Error updating the geofence under ES " + d.name + " under the org " + _u.org;
                        audit.add(_u.username, _u.org, m);
                        res.sendStatus(400);
                    } else {
                        var m = "Updated the geofence under ES " + d.name + " under the org " + _u.org;
                        audit.add(_u.username, _u.org, m);
                        res.sendStatus(400);
                    }
                });
            });
        }
    });
});

/* GET /api/geo/list
 */
router.get('/list', function (req, res) {
    gfmodel.geofenceModel.
    find({
        org: req.user.org
    }).
    sort('name').
    select('-esid -__v').
    exec(function (_e, _d) {
        if (_e) res.sendStatus(400);
        else {
            var i = 0;
            while (i < _d.length) {
                var fenceData = JSON.parse(JSON.stringify(_d[i]));
                delete fenceData.points.type;
                var fence = [];
                var j = 0;
                while (j < fenceData.points.coordinates[0].length - 1) {
                    fence.push({
                        lat: fenceData.points.coordinates[0][j][0],
                        lng: fenceData.points.coordinates[0][j][1]
                    });
                    j++;
                }
                delete fenceData.points.coordinates;
                fenceData.points = fence;
                _d[i] = JSON.parse(JSON.stringify(fenceData));
                i++;
            }
            res.json(_d);
        }
    });
});

router.get("/delete", jsonParser, function (req, res) {
    var _u = req.user;
    var _id = req.query.id;
    if (_id) {
        gfmodel.geofenceModel.
        find({
            _id: _id
        }).
        select('esid name org').
        exec(function (_e, _d) {
            var fence = _d[0];
            if (_e) {
                var m = "Error deleting the geofence " + fence.name + " under the org " + fence.org;
                audit.add(_u.username, _u.org, m);
                res.sendStatus(400);
            } else {
                gfmodel.geofenceModel.remove({
                    _id: _id
                }, function (_e, _d) {
                    if (_e) {
                        var m = "Error deleting the geofence " + fence.name + " under the org " + fence.org;
                        audit.add(_u.username, _u.org, m);
                        res.sendStatus(400);
                    } else {
                        var m = "Deleted the geofence " + fence.name + " under the org " + fence.org;
                        audit.add(_u.username, _u.org, m);
                        mgmt_geo.delete(fence.esid, function (_e) {
                            if (_e) {
                                var m = "Error deleting the geofence from ES " + fence.name + " under the org " + fence.org;
                                audit.add(_u.username, _u.org, m);
                                res.sendStatus(400);
                            } else {
                                var m = "Deleted the geofence from ES " + fence.name + " under the org " + fence.org;
                                audit.add(_u.username, _u.org, m);
                                res.end();
                            }
                        });
                    }
                });
                res.sendStatus(200);
            }
        });
    } else {
        var m = "Error deleting the geofence " + d.name + " under the org " + _u.org;
        audit.add(_u.username, _u.org, m);
        res.sendStatus(400);
    }
});

module.exports = router;