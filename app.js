var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello Luv!');
});

app.get('/crashTheServer', function (req, res) {
 process.exit(1);
})

var server = app.listen(process.env.PORT, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
