var req = require('requestify');
var kafka = require('kafka-node');

var sd = require("./datafeeder");
var config = require("../config.js");
var log = require("../server/utilities/logger").log;

var Producer = kafka.Producer;
var Client = kafka.Client;

var randomLimt = 0.99;
var interval = 30000;

var zookeeperInstance = config.kafka.zookeeper;
var telemetry_topic = config.kafka.topics.telemetry;
var alert_topic = config.kafka.topics.alerts;

var es_tele_url = config.elasticsearch.url + "/" + config.elasticsearch.index;
var es_alert_url = config.elasticsearch.url + "/" + config.elasticsearch.alert;

var client = new Client(zookeeperInstance);
var producer = new Producer(client);


function kafkaCallback(_err, _data) {
    if (_err) console.log("ERR :: " + _err);
}

var data = sd.loc;

function populate() {
    log("Stating to push data...");
    for (key in sd.loc) {
        DataFeeder(key, 1, 1, {
            Speed: Math.round(Math.random() * 20),
            Angle: 0,
            coordinates: data[key][0],
            mile: Math.floor(Math.random() * 1000),
            oil: Math.floor(Math.random() * 100),
        }, Math.floor(Math.random() * 11000) + 25000);
    }
}

producer.on('ready', function () {
    log("Produder ready!");
    log("Telemetry topic :: " + telemetry_topic);
    log("Alert topic :: " + alert_topic);
    populate();
});

function angleFromCoordinate(lat1, long1, lat2, long2) {
    var dLon = (long2 - long1);
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    var brng = Math.atan2(y, x);
    brng = brng * (180 / Math.PI); //Convert to Degrees.
    brng = (brng + 360) % 360;
    return brng
}

function DataFeeder(key, index, step, prev, _interval) {
    var loc = sd.loc[key];
    var incDec = (Math.random() > 0.8) ? -1 : 1;
    var oilInc = -0.5;
    var mileInc = 1;
    var speedInc = Math.round(Math.random() * 20) * incDec;

    var f_speed = (Math.random() > 0.5) ? true : false;
    if (prev.Speed + speedInc > 65 || prev.Speed + speedInc < 0) {
        if (f_speed) prev.Speed -= speedInc;
    } else {
        if (f_speed) prev.Speed += speedInc;
    }

    var f_mile = (Math.random() > 0.5) ? true : false;
    if (f_mile) prev.mile += mileInc;

    var f_oil = (Math.random() > 0.5) ? true : false;
    if (f_oil) prev.oil += oilInc;
    if (prev.oil < 5) prev.oil = Math.floor(Math.random() * 100);

    var bearing = angleFromCoordinate(prev.coordinates[0], prev.coordinates[1], loc[index][0], loc[index][1]);
    prev.coordinates = loc[index];

    var truckData = {
        "vid": key,
        "time": new Date(),
        "acc": "On",
        "geo": loc[index].toString(),
        "speed": prev.Speed,
        "angle": bearing,
        "locate": "V",
        "mile": prev.mile,
        "oil": prev.oil,
        "engaged": true,
        "load%": 100
    };

    var teleData = {
        topic: telemetry_topic,
        messages: JSON.stringify(truckData)
    }

    console.log(key + "\tSpeed: " + prev.Speed + "\tDistance: " + prev.mile + "\tOil: " + prev.oil);

    producer.send([teleData], kafkaCallback);

    req.request(es_tele_url + "/telemetry", {
        method: "POST",
        body: truckData,
    }).then(function (_d) {}, function (_e) {
        log("Error");
        log(_e);
    });

    if (Math.random() > randomLimt) {
        //5% chance of an alert
        var category = [
            "fuel",
            "incident",
            "navigation",
            "misc"
        ]

        var messages = [
            [ //fuel
                "Fuel Level is low (15%)",
                "Fuel Level is critical (10%)",
                "Fuel consumption is abnormal, This could be a pilferage activity"
            ],
            [ //incident
                "Driving at wee hours",
                "Unusually slow movement",
                "Vehicle made an unscheduled stop (for 20 minutes)",
                "Unusually fast movement, When did Ferrari start making trucks?"
            ],
            [ //Navigation
                "Possible path deviation",
                "Toll gate bypassed!"
            ],
            [ //misc
                "Driver doing donuts!",
                "Driver attempted drift",
                "Truck running continuous for 6 hours. Recommed break?"
            ]
        ]

        var incidentIndex = Math.floor(Math.random() * category.length)
        var incident = category[incidentIndex]
        var incidentMessageIndex = Math.floor(Math.random() * messages[incidentIndex].length)
        var incidentMessage = messages[incidentIndex][incidentMessageIndex]

        var _alertData = {
            "type": incident,
            "msg": incidentMessage,
            "isRead": false,
            "tele": truckData
        }

        var alertData = {
            topic: alert_topic,
            messages: JSON.stringify(_alertData)
        }

        producer.send([alertData], kafkaCallback)

        req.request(es_alert_url + "/alert", {
            method: "POST",
            body: _alertData,
        }).then(function (_d) {}, function (_e) {
            log("Error");
            log(_e);
        });
    }

    //Timer Function to send Data at fixed TimeIntervals
    index += step
    if (index == 0 || index == (loc.length - 1)) {
        step = -step
    }
    setTimeout(function () {
        DataFeeder(key, index, step, prev, interval)
    }, _interval);
}