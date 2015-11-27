module.exports = {
    "name": "IoT Platform",
    "elasticsearch": {
        "url": "http://localhost:9200",
        "index": "telemetrydata",
        "alert": "alerts",
        "mgmt": {
            "name": "mgmt",
            "type": {
                "usr": "users",
                "device": "devices",
            }
        },
        "geofence":{
            index: "geofences",
            type: "fence"
        },
        "audit": "audit",
        "viz": "viz",
        "aggregationInterval": 15
    },
    "kafka": {
        "zookeeper": "localhost:2181",
        "topics": {
            "telemetry": "amaya.spark.outbound.telemetry",
            "alerts": "amaya.spark.outbound.alerts"
        }
    },
    "mongo": {
        "connectionUrl": "mongodb://localhost:27017/iotplatform",
        "collections": {
            "user": "usr"
        }
    },
    redis: {
        url:"redis://127.0.0.1:6379"
    },
    secret: "there is no spoon"
}