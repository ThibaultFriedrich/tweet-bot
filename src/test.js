
var express = require('express');
var morgan = require('morgan');
var app = express();

app.get('/', function (req, res, next) {
    res.send('ok');
});

var port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log('Our app is running on http://localhost:' + port);
});
