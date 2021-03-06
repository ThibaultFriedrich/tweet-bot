var fs = require('fs');
var express = require('express');
var morgan = require('morgan');
var swig = require('swig');
var colors = require('colors');
// https://github.com/indexzero/nconf
var nconf = require('nconf');

nconf
.argv()
.env()
.file({file: __dirname+'/../twitter-conf.json'});


var users = JSON.parse(fs.readFileSync(__dirname+'/../users.json'));
var bot = require('./bot')({
    users: users,
    twitter: {
        "consumer_key": nconf.get('consumer_key'),
        "consumer_secret": nconf.get('consumer_secret'),
        "access_token_key": nconf.get('access_token_key'),
        "access_token_secret": nconf.get('access_token_secret')
    }
});

var history = {tweets:[], retweets:[]};

var app = express();

/*bot.update({
    wakeUpAt: '5 * * * * *',
    sleepAt: '10 * * * * *'
});*/


bot.onWakeUp = function () {
    console.log('good morning');
};

bot.onSleep = function () {
    console.log('good night');
};

bot.onRetweet = function (tweet) {
    console.log('I should retweet :');
    history.retweets.push(tweet);
    console.log(tweet.user.screen_name+': '+tweet.text);
    //console.log('I have just retweet');
};

bot.onError = function(error) {
    console.log(error);
};

bot.onTweet = function (tweet) {
    history.tweets.push(tweet);
};

app
.use(morgan('combined'))
.engine('html', swig.renderFile)
.set('view engine', 'html')
.set('views', __dirname+'/../views/templates')
.get('/', function (req, res) {
    res.render('index.html', {title: 'ok', history: history});
})
.use(express.static(__dirname+'/../views/static'));

var port = process.env.PORT || 8080;

var server = app.listen(port, function (req, res) {
    console.log('listening on http://localhost:'+server.address().port);
});

server.on('error', function (err) {
    console.log(err);
});
