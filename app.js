/*
Entry point for the server
*/

var express = require('express');
var expressSession = require('express-session');
var app = express();
var server = require('http').Server(app);
var event = require('events');
var compression = require('compression');
var emitter = new event.EventEmitter();
var config = require('./config');

var passport = require('passport');
require("./server/utilities/passport")(passport);
require("./server/utilities/redis");

// Dependency check
var dependencyCheck = require('./server/utilities/startupDependencyCheck');

//Routes
var iot = require('./server/routes/iot')(emitter);
var usr = require('./server/routes/user')(passport);
var device = require('./server/routes/device');
var geofence = require('./server/routes/geofence');
var viz = require('./server/routes/visualizations');
var util = require('./server/routes/util');
var log = require("./server/utilities/logger").log;

require('./server/models/model_user');
require('./server/models/model_device');
require('./server/models/model_geofence');

var backend = require('./server/sampleData/backend');

//socketIO
var socketLib = require('./server/routes/socketeer')(server, emitter);

//Start the consumers
iot.startConsumers();

app.use(compression());

app.use(expressSession({
    secret: 'may the force be with you',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules'));

var passport_parms = {
    session: false
};
app.use('/api/usr', usr);
app.use('/api/device', passport.authenticate('jwt', passport_parms), device);
app.use('/api/util', passport.authenticate('jwt', passport_parms), util);
app.use('/api/geo', passport.authenticate('jwt', passport_parms), geofence);
app.use('/api/viz', passport.authenticate('jwt', passport_parms), viz);
app.use('/b', backend);


// start the server only if the dependency checks are met
dependencyCheck.doStartupDependencyCheck(function (_d, _msg) {
    if (_d) {
        server.listen(process.env.PORT || 80, null, null, function () {
            log('Server listening at http://' + server.address().address + ':' + server.address().port);
        })
    } else {
        log("ERROR starting the platform.");
    }
});