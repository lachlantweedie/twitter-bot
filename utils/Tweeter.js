var config = require('../config'),
	Twitter = require('node-twitter'),
	EventEmitter = require("events").EventEmitter,
	tweetAuth = require('./TweetAuthenticater'),
	tweetResponder = require('./TweetResponder'),
	ee = new EventEmitter(),
	minutes = .2, 
	the_interval = minutes * 60 * 1000,
	io = null,
	q = require('q'),
	bot_on = false,
	searchWords = ['australia'],
	twitterStreamClient = new Twitter.StreamClient(
	    config.twitter.consumer_key,
	    config.twitter.consumer_secret,
	    config.twitter.access_token_key,
	    config.twitter.access_token_secret
	),
	twitterRestClient = new Twitter.RestClient(
	    config.twitter.consumer_key,
	    config.twitter.consumer_secret,
	    config.twitter.access_token_key,
	    config.twitter.access_token_secret
	);

module.exports = {

	Events : ee,

	Init : function(data){
		io = data.io;
		this.StartStream(searchWords);
	},

	Tweet : function (data){
		var savetweet = data;
		var deffered = q.defer();
		twitterRestClient.statusesUpdate(
		{ 	
			status: '@'+data.user.screen_name + ' ' + data.text // + ' #JustSayin'
			,in_reply_to_status_id: data.id.toString()
		}, 
		function (err, data) {
			if (err) {
				console.error(err);
				//replyToRandom = true;
				deffered.reject(err);
				//this.Tweet(savetweet);
			} else {
				//io.emit('tweet',data);
				deffered.resolve(data);
				io.emit('tweet', data);
				console.log(/*data*/ 'Successful tweet: ' + data.text);
			}
			return deffered.promise;
		});

	},

	StartStream : function(words){
		if(words.length > 0)
			twitterStreamClient.start(words);
		else
			console.error('No words to start twitter stream with.');
	},

	StopStream : function(){
		if(twitterStreamClient.isRunning())
			twitterStreamClient.stop();
		else
			console.log('Stream already stopped');
	},

	SearchWords : function(){
		return searchWords;
	},

	AddWordToStream : function (word){
		// word verification
		if(WordVerification(word))
			searchWords.push(word);
		if(twitterStreamClient.isRunning())
			this.StopStream();
		else
			this.StartStream(searchWords);
		//this.StartStream(searchWords);
	},

	ToggleBot : function(){
		bot_on = !bot_on;
		return bot_on;
	},

	RemoveWordFromStream : function (word){
		var index = searchWords.indexOf(word);   
		if (index !== -1) searchWords.splice(index, 1);
		this.StopStream();
		//this.StartStream(searchWords);
	},	

	Interval : the_interval,
	bot_on : bot_on

}

function WordVerification(word){
	
	if(searchWords.indexOf(word) > -1) // already in array
		return false;

	return true; // made past the tests
}

ee.on("restart", ResetStream);

function ResetStream(){
	if(searchWords.length > 0){
		twitterStreamClient.start(searchWords);
		console.log('Stream started');
	}else
		console.log('No words to start twitter stream with.');
}

// Twitter stream event functions
twitterStreamClient.on('close', function() { console.log('Connection closed.');});
twitterStreamClient.on('end', function() {console.log('End of Line.'); ee.emit('restart');});
twitterStreamClient.on('error', function(error) {console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));});

// This is where the automatic repsonse magic happens
twitterStreamClient.on('tweet', function(tweet) {
	
	//console.log(tweet.text);

	if(tweetResponder.isActive && bot_on && tweetAuth.CheckTweetContainsAllWords(tweet.text, searchWords)){ 
		ee.emit('tweet', tweet); // emit for app.js
		io.emit('tweet',tweet); // emit the incoming tweet to client

		console.log('\nTweet captured: ' + tweet.text );	//log

   		RespondToTweet(tweet);

   		tweetResponder.isActive = false;
   		setTimeout(function(){tweetResponder.isActive = true;}, the_interval);
   }

});

function RespondToTweet(tweet){
	tweetResponder.Respond({message: tweetAuth.ConvertTweetToKeyWords(tweet.text), tweet: tweet}) // get tweet data from bot
        .then(module.exports.Tweet)  // tweet the data
        .catch(function(error){console.log('chaining failed (retrying): ' + error); RespondToTweet(tweet)});  // error catching
}