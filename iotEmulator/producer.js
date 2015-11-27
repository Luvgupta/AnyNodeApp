var sd = require("./datafeeder")
var request = require('request')
var kafka = require('kafka-node')
var Producer = kafka.Producer
var Client = kafka.Client
var KeyedMessage = kafka.KeyedMessage


var randomLimt = 0.99
var interval = 30000
var zookeeperInstance = 'localhost:2181'
var telemetry_topic = "amaya.spark.inbound.statuses";
var alert_topic = "amaya.spark.outbound.alerts"


var client = new Client(zookeeperInstance)
var producer = new Producer(client)


function kafkaCallback(_err, _data) {
    if (_err) console.log(_err)
}

var data = sd.loc

function populate() {
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
    populate()
})

function angleFromCoordinate(lat1, long1, lat2, long2) {
    var dLon = (long2 - long1)
    var y = Math.sin(dLon) * Math.cos(lat2)
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
    var brng = Math.atan2(y, x)
    brng = brng * (180 / Math.PI) //Convert to Degrees.
    brng = (brng + 360) % 360
        //brng = 360 - brng
    return brng
}

function getDateTime(incomingDate) {
    if (typeof incomingDate != "undefined") {
        var sd = incomingDate;
        var syear = sd.getFullYear();
        var smonth = ("0" + (sd.getMonth() + 1)).slice(-2);
        var sdate = ("0" + sd.getDate()).slice(-2);
        var shours = ("0" + sd.getHours()).slice(-2);
        var sminutes = ("0" + sd.getMinutes()).slice(-2);
        var ssec = ("0" + sd.getSeconds()).slice(-2);
        var startDate = syear + "-" + smonth + "-" + sdate;
        var startTime = shours + ":" + sminutes + ":" + ssec;
        return startDate + " " + startTime;
    }
    return "";
}

function DataFeeder(key, index, step, prev, _interval) {
    var loc = sd.loc[key]
    var incDec = (Math.random() > 0.8) ? -1 : 1
    var oilInc = -1
    var mileInc = 1
    var speedInc = Math.round(Math.random() * 20) * incDec;

    var f_speed = (Math.random() > 0.5) ? true : false;
    if (prev.Speed + speedInc > 65 || prev.Speed + speedInc < 0) {
        if (f_speed) prev.Speed -= speedInc
    } else {
        if (f_speed) prev.Speed += speedInc
    }

    var f_mile = (Math.random() > 0.5) ? true : false;
    if (f_mile) prev.mile += mileInc

    var f_oil = (Math.random() > 0.5) ? true : false;
    if (f_oil) prev.oil += oilInc
    if (prev.oil < 5) prev.oil = Math.floor(Math.random() * 100)

    var bearing = angleFromCoordinate(prev.coordinates[0], prev.coordinates[1], loc[index][0], loc[index][1])
    prev.coordinates = loc[index]

    var truckData = {
        "VNo": key,
        "Time": getDateTime(new Date()),
        "Acc": "On",
        "Lat": loc[index][0],
        "Lon": loc[index][1],
        "Speed": prev.Speed,
        "Angle": bearing,
        "Locate": "V",
        "Oil": prev.oil,
        "Mile": prev.mile
    }

    //    console.log(JSON.stringify(truckData))
    console.log(key + "\tSpeed: " + prev.Speed + "\tDistance: " + prev.mile + "\tOil: " + prev.oil);

    var km = new KeyedMessage(key, JSON.stringify(truckData));
    //    console.log(km);

    var teleData = {
        topic: telemetry_topic,
        messages: km
    }

    producer.send([teleData], kafkaCallback)

    //Timer Function to send Data at fixed TimeIntervals
    index += step
    if (index == 0 || index == (loc.length - 1)) {
        step = -step
    }
    setTimeout(function () {
        DataFeeder(key, index, step, prev, interval)
    }, _interval)
}