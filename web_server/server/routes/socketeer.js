var emitter = null;

var log = require("../utilities/logger.js").log;

var socketeer = function (server, emittr) {
    emitter = emittr
    var io = require('socket.io')(server)
    io.on('connection', handleClient)
}

var sockets = [];
var handleClient = function (socket) {
    socket.emit("Hello!")
    socket.on("ping", function (data) {
        log("got ping")
        socket.emit("pong", data)
    })
    var telemetryListener = telemetryListenerFunction(socket)
    var alertListener = alertListenerFunction(socket)
    emitter.on("NewTelemetry", telemetryListener)
    emitter.on("AlertAdded", alertListener)

    socket.on('disconnect', function () {
        emitter.removeListener("NewTelemetry", telemetryListener)
        emitter.removeListener("AlertAdded", alertListener)
    })
}


function telemetryListenerFunction(socket) {
    return function (t) {
        if (t) {
            socket.emit("telemetry_response", JSON.parse(t))
        } else {
            log("Nothing to emit....")
        }
    }
}

function alertListenerFunction(socket) {
    return function (_a) {
        socket.emit("alert", JSON.parse(_a))
    }
}


module.exports = socketeer