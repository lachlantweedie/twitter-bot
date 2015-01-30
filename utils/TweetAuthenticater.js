module.exports = {

	// checks if tweet contains all the words we wants
	CheckTweetContainsAllWords: function(tweetText, wordsArray) {

		tweetText = tweetText.toLowerCase();

		for(var i = 0; i<wordsArray.length; i++){
			if(tweetText.indexOf(wordsArray[i].toLowerCase()) == -1){
				return false;
			}
		}
		return true;
	},

	ConvertTweetToKeyWords: function(text) {
		text = text.toLowerCase(); // all lowercase
		text = text.replace(/https?:\/\/[^\s]+/, ''); // strips urls
		text = text.replace(/#/g, ''); // strips hashtags
		return text;
	}


}