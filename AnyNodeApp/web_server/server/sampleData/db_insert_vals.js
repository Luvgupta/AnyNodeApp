var exports = {};

exports.truckDetails = [
    {
        "vid": "13512345001",
        "registrationNumber": "KA 67 D 6570",
        "make": "MAHINDRA NAVISTAR",
        "permit": "All India",
        "modelYear": "2014",
        "type": "telemetry"
    },
    {
        "vid": "13512345002",
        "registrationNumber": "KL 01 HM 2947",
        "make": "Tata LPS 4018",
        "permit": "Karnataka State",
        "modelYear": "2012",
        "type": "telemetry"
    },
    {
        "vid": "13512345003",
        "registrationNumber": "MH 28 J 5807",
        "make": "TATA ACE",
        "permit": "South India",
        "modelYear": "2010",
        "type": "telemetry"
    },
    {
        "vid": "13512345004",
        "registrationNumber": "MH 12 H 23",
        "make": "Eicher 10.59 XP",
        "permit": "North India",
        "modelYear": "2000",
        "type": "telemetry"
    },
    {
        "vid": "13512345005",
        "registrationNumber": "UP 9 GH 7639",
        "make": "SML ISUZU Supreme",
        "permit": "UP State",
        "modelYear": "1999",
        "type": "telemetry"
    },
    {
        "vid": "13512345006",
        "registrationNumber": "GA 3 H 4597",
        "make": "Ashok Leyland 1616 il",
        "permit": "West India",
        "modelYear": "2005",
        "type": "telemetry"
    },
    {
        "vid": "13512345007",
        "registrationNumber": "SA 7 I 5H",
        "make": "SpeedWagon",
        "permit": "Greater Pune",
        "modelYear": "1978",
        "type": "telemetry"
    }
];

exports.es_data = [
    {
        "vid": "13512345001",
        "time": new Date(),
        "geo": [12.903703333333333, 77.64680166666666].toString(),
        "speed": 19,
        "angle": 148.5013101358988,
        "mile": 945,
        "oil": 58,
        "engaged": false,
        "load%": 20
    },
    {
        "vid": "13512345002",
        "time": new Date(),
        "geo": [12.92799, 77.67024833333333].toString(),
        "speed": 7,
        "angle": 298.75449237540715,
        "mile": 357,
        "oil": 9,
        "engaged": false,
        "load%": 20
    },
    {
        "vid": "13512345003",
        "time": new Date(),
        "geo": [18.566916666666668, 73.82943166666666].toString(),
        "speed": 17,
        "angle": 29.718919123656235,
        "mile": 365,
        "oil": 72,
        "engaged": false,
        "load%": 20
    },
    {
        "vid": "13512345004",
        "time": new Date(),
        "geo": [19.122213333333335, 73.01419].toString(),
        "speed": 16,
        "angle": 270.32261081860554,
        "mile": 639,
        "oil": 22,
        "engaged": false,
        "load%": 20
    },
    {
        "vid": "13512345005",
        "time": new Date(),
        "geo": [18.566501666666667, 73.829245].toString(),
        "speed": 19,
        "angle": 23.11079209098051,
        "mile": 286,
        "oil": 45,
        "engaged": false,
        "load%": 20
    },
    {
        "vid": "13512345006",
        "time": new Date(),
        "geo": [19.256546666666665, 72.98119666666666].toString(),
        "speed": 10,
        "angle": 132.9491062086754,
        "mile": 674,
        "oil": 90,
        "engaged": false,
        "load%": 20
    },
    {
        "vid": "13512345007",
        "time": new Date(),
        "geo": [19.2566733333333318, 72.9809316666666632].toString(),
        "speed": 10,
        "angle": 132.9491062086754,
        "mile": 764,
        "oil": 78,
        "engaged": false,
        "load%": 20
    }
];

exports.overall_status = {
    "fleet": {
        "total": 100,
        "active": 30,
        "accidents": 15,
        "inService": 20,
        "toService": 15
    },
    "avgStatus": {
        "mileage": {
            "today": 8.5,
            "yesterday": 9.1,
        },
        "breakdown": {
            "today": 2,
            "yesterday": 4
        },
        "pilferage": {
            "today": 50,
            "yesterday": 48
        },
        "fuelCost": {
            "today": 57.6,
            "yesterday": 56.5
        },
        "tripInfo": {
            "completed": 5,
            "pending": 90,
            "starting": 5
        }
    }
};

exports.telemetryData = [
    {
        "vid": "KA 67 D 6570",
        "time": new Date(),
        "geo": [12.903703333333333, 77.64680166666666].toString(),
        "speed": 19,
        "angle": 148.5013101358988,
        "mile": 945,
        "oil": 58,
        "engaged": false,
        "load%": 20
    },
    {
        "vid": "KL 01 HM 2947",
        "time": new Date(),
        "geo": [12.92799, 77.67024833333333].toString(),
        "speed": 7,
        "angle": 298.75449237540715,
        "mile": 357,
        "oil": 9,
        "engaged": false,
        "load%": 20
    },
    {
        "vid": "MH 28 J 5807",
        "time": new Date(),
        "geo": [18.566916666666668, 73.82943166666666].toString(),
        "speed": 17,
        "angle": 29.718919123656235,
        "mile": 365,
        "oil": 72,
        "engaged": false,
        "load%": 20
    },
    {
        "vid": "MH 12 H 23",
        "time": new Date(),
        "geo": [19.122213333333335, 73.01419].toString(),
        "speed": 16,
        "angle": 270.32261081860554,
        "mile": 639,
        "oil": 22,
        "engaged": false,
        "load%": 20
    },
    {
        "vid": "UP 9 GH 7639",
        "time": new Date(),
        "geo": [18.566501666666667, 73.829245].toString(),
        "speed": 19,
        "angle": 23.11079209098051,
        "mile": 286,
        "oil": 45,
        "engaged": false,
        "load%": 20
    },
    {
        "vid": "GA 3 H 4597",
        "time": new Date(),
        "geo": [19.256546666666665, 72.98119666666666].toString(),
        "speed": 10,
        "angle": 132.9491062086754,
        "mile": 674,
        "oil": 90,
        "engaged": false,
        "load%": 20
    },
    {
        "vid": "SA 7 I 5H",
        "time": new Date(),
        "geo": [19.2566733333333318, 72.9809316666666632].toString(),
        "speed": 10,
        "angle": 132.9491062086754,
        "mile": 764,
        "oil": 78,
        "engaged": false,
        "load%": 20
    }
]

module.exports = exports;