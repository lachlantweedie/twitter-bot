var Cleverbot = require('../node_modules/cleverbot-node/lib/cleverbot'),
	CBots = new Cleverbot,
	latestTweet = '',
	q = require('q'),
	active = true,

	// Private Functions 

	// Get response from clever bot api
	GetCleverbotResponse = function(text){
		var deffered = q.defer();


  		CBots.write(latestTweet, function(resp){
  			var tweetdata = resp['message'];
  			if(	!tweetdata ||
  				 tweetdata.indexOf('Cleverbot') > -1 || 
    		 	 tweetdata.indexOf('Error') > -1) 	
    				deffered.reject('err - ' + tweetdata) // error

			else 	deffered.resolve(tweetdata); // success
  		});


  		return deffered.promise;
	};


// Public function
module.exports = {

	// Get a response from cleverbot
	Respond: function(resp) {
		var deffered = q.defer();
		GetCleverbotResponse(resp['message'])
		.then(function(data){
			resp['tweet'].text = data;
			deffered.resolve(resp['tweet']);
		})
		.catch(function(error){
			deffered.reject(error);
		});
		return deffered.promise;
	},

	isActive : active
}

