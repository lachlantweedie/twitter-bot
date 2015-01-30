
var address = window.location.protocol + '//' + window.location.host,
    details = {
      resource: (window.location.pathname.split('/').slice(0, -1).join('/') + '/socket.io').substring(1)
    },
    socket = io.connect();


window.onload = function () {
// control methods called upfront !
}

$( document ).ready(function() {

  // call to possible layout adjuster
  // fixLayout();

  var tweetList = $('ul.tweets'),
      mainContainer = $('#main-container'),
      searchWords = [],
      botOn = false,

      resetSearchWordsHTML = function(){
        var searchString = 'Searching for: ';
        for(var i =0; i<searchWords.length; i++) // add all search words to string with <a> tags
          searchString += '<a href="#" class="removeWord" >' + searchWords[i] + '</a> ';
        $('.search-words').html(searchString);
        // Removing a word functionality
        $('.removeWord').click(function(){

          var index = searchWords.indexOf($(this).html());    // <-- Not supported in <IE9
          if (index !== -1) searchWords.splice(index, 1);
          resetSearchWordsHTML();
          socket.emit('removeSearchableWord',{ word: $(this).html()});

        });
      };




  // Init 
  socket.on('init', function (data) {

    botOn = data.botOn;
    searchWords = data.searchWords;
    resetSearchWordsHTML();
  
    
  });

  // Reciever of Twitter data
  socket.on('tweet', function (data) {

    var item = '<li><img src="'+ data.user.profile_image_url +'" />'
    + '<span>  @'
    + data.user.screen_name
    + ':</span> <p>\n'
    + data.text
    + '</p></li>';

    tweetList.prepend(item);
  });

  // Reciever of Instagram data
  socket.on('insta', function (data) {

  });

  // Reciever of Temperature data from DHT22 units
  socket.on('DHT22', function (data) {

  });

  // Reciever of proximity data from HC-sr04 units
  socket.on('HC-SR04', function (data) {

  });

  // Reciever of motion data from IR sensor
  socket.on('PIR', function (data) {

  });

  $('#bot-toggle').click(function(){
  socket.emit('toggleBot',{});
  botOn = !botOn;
  var a = botOn ? 'ON' : 'OFF';

  $('#bot-activity').html("Bot is " + a);
  });

  $('#add-new-searchword').click(function(){
    var newWord = $('#searchWordText').val();
    searchWords.push(newWord);
    resetSearchWordsHTML();
    socket.emit('addSearchableWord',{ word: newWord});
    $('#searchWordText').val('');
  });



});

window.onresize = function(){

fixLayout();
};

function fixLayout(){

}

function RemoveWord(e){
alert(e);
}