var mongoose = require('mongoose');

var log = require('util').log;


mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("hello world");

    var kittySchema = mongoose.Schema({
        name: 'string',
        color: {
            type: 'string',
            default: 'white'
        }
    });

    var Kitten = mongoose.model('Kitten', kittySchema);

    var fluffy = new Kitten({
        name: new Date()
    });
//    fluffy.save(function (err, fluffy) {
//        if (err) return console.error(err);
//        console.log(fluffy.name);
//    });
//
//    Kitten.find(function (err, kittens) {
//        if (err) return console.error(err);
//        console.log(kittens);
//    })
//
//    Kitten.find({
//        name: 'fluffy'
//    }).find(function (_err, _d) {
//        console.log("Error - " + _err);
//        console.log("Data - " + _d);
//    });

    fluffy.save()
    
    Kitten.find({
        color: 'white'
    }).find(function (_err, _d) {
        log("Error - " + _err);
        log("Data - " + _d);
    });
    
});
