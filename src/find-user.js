
// https://dev.twitter.com/streaming/overview/request-parameters
var Twitter = require('twitter');
var conf = require('../twitter-conf');

var twitter = new Twitter(conf);

var client = twitter.get('users/show', {screen_name: 'CVSTENE'}, function (err, user){
    if (err) {
        console.log(err);
        return;
    }

    console.log(user);
    console.log(user.id);
});
