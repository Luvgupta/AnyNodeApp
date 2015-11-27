var req = require('requestify');

//testLoginLogOff("alice", "password");
//testUserAdd("alice", "password");
//testDeviceRemove("admin", "password");
//testDeviceListing("admin", "password");
//testDeviceGet("admin", "password");
//testDeviceUpdate("admin", "password");
//testGetAuditLog("admin", "password");
//testVizDistFuel("jerry", "password");
//testVizTele("jerry", "password");
//testGeoCreate("jerry", "password");
testGeoRetrieve("jerry", "password");


function log(s) {
    console.log(s);
}

var username = "admin";
var passowrd = "password";

function testLoginLogOff(n, p) {
    log("Testing login-logoff");
    req.post("http://localhost/usr/login", {
        "username": n,
        "password": p,
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);

        log("Session Key :: " + _r.authKey);

        req.get("http://localhost/usr/session", {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            log("Session Valid");
            req.get("http://localhost/usr/session", {
                headers: {
                    "auth-Key": "xxxxx"
                }
            }).then(function (res) {
                log("ERROR :: Session Valid");
            }, function (err) {
                log("Error in session check");
                req.get("http://localhost/usr/logoff", {
                    headers: {
                        "auth-Key": _r.authKey
                    }
                }).then(function (res) {
                    log("User logged off!");
                }, function (err) {
                    log("Error in session check");
                });
            });
        }, function (err) {
            log("Error in session check");
        });
    }, function (err) {
        log(err);
    });
}

function testUserAdd(n, p) {
    log("Testing add new user");
    req.post("http://localhost/usr/login", {
        "username": "admin",
        "password": "password",
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);

        console.log("Session Key :: " + _r.authKey);

        req.post("http://localhost/usr/add", {
            "username": n,
            "password": p,
            "isAdmin": "false",
            "canManageVehicle": "false",
            "canManageUsers": "false",
        }, {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            console.log("added new user");
            testLoginLogOff(n, p);
        }, function (err) {
            console.log("Error in session check");
        });
    }, function (err) {
        console.log(err);
    });
}

function testDeviceAdd(n, p) {
    log("Testing add new device");
    req.post("http://localhost/usr/login", {
        "username": n,
        "password": p,
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);
        console.log("Session Key :: " + _r.authKey);

        req.post("http://localhost/device/add", {
            "vid": "13512345005",
            "registrationNumber": "UP 9 GH 7639",
            "make": "SML ISUZU Supreme",
            "permit": "UP State",
            "modelYear": "1999"
        }, {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            console.log("added new device");
        }, function (err) {
            console.log("ERROR");
        });
    }, function (err) {
        console.log(err);
    });
}

function testDeviceRemove(n, p) {
    log("Testing remove new device");
    req.post("http://localhost/usr/login", {
        "username": n,
        "password": p,
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);
        console.log("Session Key :: " + _r.authKey);

        req.get("http://localhost/device/delete?vid=13512345005", {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            console.log("Removed new device");
        }, function (err) {
            console.log("ERROR");
        });
    }, function (err) {
        console.log(err);
    });
}

function testDeviceListing(n, p) {
    log("Testing remove new device");
    req.post("http://localhost/usr/login", {
        "username": n,
        "password": p,
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);
        console.log("Session Key :: " + _r.authKey);

        req.get("http://localhost/device/list", {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            console.log("list of devices");
            console.log(JSON.stringify(JSON.parse(res.body), null, "\t"));
        }, function (err) {
            console.log("ERROR");
        });
    }, function (err) {
        console.log(err);
    });
}

function testDeviceGet(n, p) {
    log("Testing remove new device");
    req.post("http://localhost/usr/login", {
        "username": n,
        "password": p,
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);
        console.log("Session Key :: " + _r.authKey);

        req.get("http://localhost/device/get?vid=13512345005", {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            console.log(JSON.stringify(JSON.parse(res.body), null, "\t"));
        }, function (err) {
            console.log("ERROR");
        });
    }, function (err) {
        console.log(err);
    });
}

function testDeviceUpdate(n, p) {
    log("Testing remove new device");
    req.post("http://localhost/usr/login", {
        "username": n,
        "password": p,
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);
        console.log("Session Key :: " + _r.authKey);

        req.get("http://localhost/device/get?vid=13512345005", {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            console.log(JSON.stringify(JSON.parse(res.body), null, "\t"));
            var _d = JSON.parse(res.body);

            req.post("http://localhost/device/update", {
                "id": _d._id,
                "vid": "13512345005xxx",
                "registrationNumber": "UP 9 GH 7639xxx",
            }, {
                headers: {
                    "auth-Key": _r.authKey
                }
            }).then(function (res) {
                console.log("updated new device");

                setTimeout(function () {
                    req.get("http://localhost/device/get?vid=13512345005xxx", {
                        headers: {
                            "auth-Key": _r.authKey
                        }
                    }).then(function (res) {
                        console.log(res.body ? JSON.stringify(JSON.parse(res.body), null, "\t") : "NULL");
                    }, function (_e) {
                        console.log("ERROR in retrieve");
                    });
                }, 1000);

            }, function (err) {
                console.log("ERROR");
            });

        }, function (err) {
            console.log("ERROR");
        });
    }, function (err) {
        console.log(err);
    });
}

function testGetAuditLog(n, p) {
    log("Testing remove new device");
    req.post("http://localhost/usr/login", {
        "username": n,
        "password": p,
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);
        console.log("Session Key :: " + _r.authKey);

        req.get("http://localhost/api/audit?offset=0", {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            console.log(JSON.stringify(JSON.parse(res.body), null, "\t"));
        }, function (err) {
            console.log("ERROR");
        });
    }, function (err) {
        console.log(err);
    });
}

function testVizDistFuel(n, p) {
    log("Testing viz data");
    req.post("http://localhost/usr/login", {
        "username": n,
        "password": p,
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);
        console.log("Session Key :: " + _r.authKey);

        var d1 = new Date();
        var d2 = new Date();
        d2.setDate(d1.getDate() - 1);
        console.log("end :: " + d1.toISOString());
        console.log("start :: " + d2.toISOString());
        req.get("http://localhost/viz/distFuel?id=" + 13512345001 + "&st=" + d2.toISOString() + "&et=" + d1.toISOString(), {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            console.log(res.body);
            //            console.log(JSON.stringify(JSON.parse(res.body), null, "\t"));
        }, function (err) {
            console.log("ERROR");
        });
    }, function (err) {
        console.log(err);
    });
}

function testVizTele(n, p) {
    log("Testing viz telemetry data");
    req.post("http://localhost/usr/login", {
        "username": n,
        "password": p,
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);
        console.log("Session Key :: " + _r.authKey);

        var d1 = new Date();
        var d2 = new Date();
        d2.setDate(d1.getDate() - 1);
        console.log("end :: " + d1.toISOString());
        console.log("start :: " + d2.toISOString());
        req.get("http://localhost/viz/telemetry?id=" + 13512345001 + "&st=" + d2.toISOString() + "&et=" + d1.toISOString() + "&offset=0", {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            //            console.log(res.body);
            console.log(JSON.stringify(JSON.parse(res.body), null, "\t"));
        }, function (err) {
            console.log("ERROR");
        });
    }, function (err) {
        console.log(err);
    });
}

function testGeoCreate(n, p) {
    log("Testing create geo-fence");
    req.post("http://localhost/usr/login", {
        "username": n,
        "password": p,
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);
        console.log("Session Key :: " + _r.authKey);

        var d = {
            "name": "j01",
            "points": [{
                "lat": 12.920966646319206,
                "lng": 77.66467723064125
            }, {
                "lat": 12.921055532298137,
                "lng": 77.66547652892768
            }, {
                "lat": 12.92055358753147,
                "lng": 77.6655516307801
            }, {
                "lat": 12.920443786979295,
                "lng": 77.66460749320686
            }]
        };

        var d2 = {
            "name": "M01",
            "points": [
                {
                    "lat": 19.06891189330194,
                    "lng": 73.00009857863188
            },
                {
                    "lat": 19.068668530595524,
                    "lng": 73.00351034849882
            },
                {
                    "lat": 19.065849553207013,
                    "lng": 73.0031455680728
            },
                {
                    "lat": 19.06593067552839,
                    "lng": 72.99962650984526
            }
          ]
        };

        req.post("http://localhost/api/geo/create", d, {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            console.log(JSON.stringify(JSON.parse(res.body), null, "\t"));
        }, function (err) {
            console.log("ERROR");
        });

        req.post("http://localhost/api/geo/create", d2, {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            console.log(JSON.stringify(JSON.parse(res.body), null, "\t"));
        }, function (err) {
            console.log("ERROR");
        });
    }, function (err) {
        console.log(err);
    });
}

function testGeoRetrieve(n, p) {
    log("Testing create geo-fence");
    req.post("http://localhost/usr/login", {
        "username": n,
        "password": p,
        "org": "AMAYA"
    }).then(function (res) {
        var _r = JSON.parse(res.body);
        console.log("Session Key :: " + _r.authKey);

        req.get("http://localhost/api/geo/list", {
            headers: {
                "auth-Key": _r.authKey
            }
        }).then(function (res) {
            console.log(res.body);
        }, function (err) {
            console.log("ERROR");
        });
    }, function (err) {
        console.log(err);
    });
}