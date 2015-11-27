/*
Kafka consumer for telemetry and alerts
*/
var config = require('../../config')
var log = require("../utilities/logger.js").log;
var kafka = require('kafka-node')

var emttr = null
var router = {}

var Consumer = kafka.Consumer
var Client = kafka.Client
var client = new Client(config.kafka.zookeeper)

var topics = [
    {
        topic: config.kafka.topics.telemetry,
        partition: 0
    },
    {
        topic: config.kafka.topics.alerts,
        partition: 0
    }
]

router.startConsumers = function () {
    log("Stating the telemetry consumers...")
    var consumer = new Consumer(client, topics, {})
    consumer.on('message', function (_m) {
        if (_m.topic === config.kafka.topics.telemetry) handleTelemetryData(_m.value)
        if (_m.topic === config.kafka.topics.alerts) handleAlertData(_m.value)
    })

    consumer.on('error', function (err) {
        log('ERROR', err)
    })
}

function handleTelemetryData(_data) {
    emttr.emit("NewTelemetry", _data)
}

function handleAlertData(_data) {
    emttr.emit("AlertAdded", _data)
}

var exports = function (emitter) {
    emttr = emitter
    return router
}

module.exports = exports