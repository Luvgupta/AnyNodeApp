/* global Promise */
var dbExp = {};
var config = require("../../config")
var log = require("./logger").log;
var url = config.elasticsearch.url + "/";
var utils = require('./general');
var req = require('requestify');

/*  Get the current location of the vehicle by
    querying ES for the latest data entry
    Author: Jerry M.
    Date: 15th Sept. 2015
*/
dbExp.getCurrentLocation = function (_id, cb) {
    var _url = url + config.elasticsearch.index + "/_search";
    var query = {
        "from": 0,
        "size": 1,
        "sort": {
            "time": {
                "order": "desc"
            }
        },
        "query": {
            "term": {
                "vid": _id
            }
        }
    };
    req.post(_url, query).then(function (_d) {
        var body = JSON.parse(_d.body);
        if (body.hits.total == 0) cb(null, {});
        else cb(null, body.hits.hits[0]._source);
    }, function (_e) {
        cb(true);
    });
}

/*  Get the last 100 alerts
    Author: Jerry M.
    Date: 15th Sept. 2015
*/
dbExp.getAlerts = function (_cb) {
    var _url = url + config.elasticsearch.alert + "/_search";
    var query = {
        "from": 0,
        "size": 100,
        "sort": {
            "time": {
                "order": "desc"
            }
        }
    };
    req.post(_url, query).then(function (_d) {
        var body = JSON.parse(_d.body);
        if (body.hits.total == 0) cb(null, {});
        else _cb(null, body.hits);
    }, function (_e) {
        _cb(true);
    });
}

/*  Gets the list of alerts for each of the vechicle.
    Author: Jerry M.
    Date: 15th Sept. 2015
*/
dbExp.getAlertsForVehicle = function (_vid, _cb) {
    var _url = url + config.elasticsearch.alert + "/_search";
    var query = {
        "from": 0,
        "size": 100,
        "sort": {
            "time": {
                "order": "desc"
            }
        },
        "query": {
            "term": {
                "vid": _vid
            }
        }
    };
    req.post(_url, query).then(function (_d) {
        var body = JSON.parse(_d.body);
        if (body.hits.total == 0) cb(null, {});
        else _cb(null, body.hits);
    }, function (_e) {
        _cb(true);
    });
};

/*  Mark the alert as done.
 */
dbExp.ackAlert = function (alertid, _cb) {
    var _url = url + config.elasticsearch.alert + "/alert/" + alertid + "/_update";
    req.post(_url, '{doc:{isRead:true}}').then(function (_d) {
        _cb();
    }, function (_e) {
        _cb(true);
    });
};

/*  Search based on start and end time and return the result
    Author: Abilash Mohan
    Modified: Jerry M.
    Date: 17th Sept. 2015
 */
dbExp.getTelemetry = function (_id, _st, _et, _offset, _cb) {
    var _url = url + config.elasticsearch.index + "/_search";
    var querystruct = {
        "from": _offset,
        "size": 200,
        "fields": ["vid", "time", "geo"],
        "sort": {
            "time": {
                "order": "asc"
            }
        },
        "query": {
            "filtered": {
                "query": {
                    "match": {
                        "vid": _id
                    }
                },
                "filter": {
                    "range": {
                        "time": {
                            "gte": _st,
                            "lt": _et
                        }
                    }
                }
            }
        }
    };
    req({
        url: _url,
        method: "POST",
        'content-type': "applicaiton/json",
        body: JSON.stringify(querystruct)
    }, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var ret = JSON.parse(body);
            ret = ret.hits;
            _cb(null, ret);
        } else {
            _cb(true);
        }
    });
};


/*  get distance and fuel for the last 24 hours
    Author: Jerry M.
    Date: 26th Oct. 2015
 */
dbExp.getDistFuel = function (_vid, _st, _et, _offset, _cb) {
    var _url = url + config.elasticsearch.index + "/_search";
    var querystruct = {
        "fields": ["vid", "oil", "mile", "time"],
        "query": {
            "filtered": {
                "filter": {
                    "range": {
                        "time": {
                            "lte": _et,
                            "gte": _st
                        }
                    }
                },
                "query": {
                    "match": {
                        "vid": _vid
                    }
                }
            }
        },
        "from": _offset,
        "size": "200",
        "sort": {
            "time": {
                "order": "asc"
            }
        }
    };
    req({
        url: _url,
        method: "POST",
        'content-type': "applicaiton/json",
        body: JSON.stringify(querystruct)
    }, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var ret = JSON.parse(body);
            ret = ret.hits;
            if (ret.total == 0) _cb(true);
            else _cb(null, ret);
        } else {
            _cb(true);
        }
    });
};

/*  get the complete list of vids
    Author: Jerry M.
    Date: 27th Oct. 2015
 */
dbExp.getAllVehicles = function (_offset, _cb) {
    var _url = url + config.elasticsearch.mgmt.name + "/" + config.elasticsearch.mgmt.type.device + "/_search";
    var querystruct = {
        "fields": ["vid"],
        "from": _offset,
        "size": "200",
    };
    req.post(_url, querystruct).then(function (_d) {
        var ret = JSON.parse(body);
        ret = ret.hits;
        if (ret.total == 0) _cb(true);
        else _cb(null, ret);
    }, function (_e) {
        _cb(true);
    });
};

/*
insert the computed values into the viz index
*/
dbExp.addVizData = function (_d) {
    var _url = url + config.elasticsearch.viz + "/viz";
    req({
        url: _url,
        method: "POST",
        'content-type': "applicaiton/json",
        body: JSON.stringify(_d)
    }, function (err, res, body) {
        if (err) {
            log("Error in inserting aggregated data");
        }
    });
}

/*
    retrieve the viz data
*/
dbExp.getVizData = function (_vid, _st, _et, _offset, _cb) {
    var _url = url + config.elasticsearch.viz + "/_search";
    var querystruct = {
        "query": {
            "filtered": {
                "filter": {
                    "range": {
                        "time": {
                            "lte": _et,
                            "gte": _st
                        }
                    }
                },
                "query": {
                    "match": {
                        "vid": _vid
                    }
                }
            }
        },
        "from": _offset,
        "size": "200",
        "sort": {
            "time": {
                "order": "asc"
            }
        }
    };
    req({
        url: _url,
        method: "POST",
        'content-type': "applicaiton/json",
        body: JSON.stringify(querystruct)
    }, function (err, res, body) {
        if (err || res.statusCode != 200) {
            log("Error in fetching data");
            _cb(true);
        } else {
            var ret = JSON.parse(body);
            ret = ret.hits;
            if (ret.total == 0) _cb(true);
            else _cb(null, ret);
        }
    });
}


module.exports = dbExp;