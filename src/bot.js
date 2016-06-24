// https://github.com/node-schedule/node-schedule
var schedule = require('node-schedule');
// https://dev.twitter.com/streaming/overview/request-parameters
var Twitter = require('twitter');

function Bot(opts) {

    var twitter = null;

    var bot = this;
    var users = {};

    this.onTweet = null;
    this.onWakeUp = null;
    this.onSleep = null;
    this.onRetweet = null;
    this.onError = null;

    this.wakeUpSchedule = null;
    this.sleepSchedule = null;

    this.wakeUp = function () {
        this.onWakeUp && this.onWakeUp();
    };

    this.sleep = function () {
        this.onSleep && this.onSleep();
    };
    
    this.retweet = function (tweet) {

        var user = users[tweet.user.screen_name];
        var random = Math.random();

        if (random < user.rt.proba) {
            var delay = Math.random() * (user.rt.maxDelay - user.rt.minDelay) + user.rt.minDelay;
            setTimeout(function () {
                // we retweet
                this.onRetweet && this.onRetweet(tweet);
            }, delay);
        }

    };

    this.update = function (opts) {
        if (opts.hasOwnProperty('users')) {
            users = opts.users;
        }

        if (opts.hasOwnProperty('wakeUpAt')) {
            if (this.wakeUpSchedule) {
                this.wakeUpSchedule.cancel();
            }
            this.wakeUpSchedule = schedule.scheduleJob(opts.wakeUpAt, function(){
                bot.wakeUp();
            });
        }

        if (opts.hasOwnProperty('sleepAt')) {
            if (this.sleepSchedule) {
                this.sleepSchedule.cancel();
            }
            this.sleepSchedule = schedule.scheduleJob(opts.sleepAt, function () {
                bot.sleep();
            });
        }

        if (opts.hasOwnProperty('twitter')) {
            twitter = new Twitter(opts.twitter);

            var follow = '';
            for (var index in users) {
                if (follow != '') {
                    follow += ',';
                }
                follow += users[index].id;
            }

            if (follow != '') {
                //console.log(follow);

                var stream = twitter.stream('statuses/filter', {follow: follow});
                stream.on('data', function (tweet) {
                    bot.onTweet && bot.onTweet(tweet);
                    bot.retweet(tweet);
                });

                stream.on('error', function (error) {
                    bot.onError && bot.onError(error); 
                });
            }
        }
    };


    this.update(opts);

}

module.exports = function (opts) {
    return new Bot(opts);
};
