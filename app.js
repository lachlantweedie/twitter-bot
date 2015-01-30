var //MongoClient = require('mongodb').MongoClient,
  express = require('express'),
  app = express(),
  config = require('./config'),
  server = require('http').Server(app);
  math = require('math'),
  ip = require('ip').address(),
  io = require('socket.io')(server,{}), 
  port = process.env.PORT || 3000,
  Tweeter = require('./utils/Tweeter'),
  routes = require('./routes/routes'),
  colors  = require('colors'),
  casual = require('casual'),
  q = require('q'),
  Instagram = require('instagram-node-lib'),
  five = require('johnny-five'),
  board = new five.Board(),
  led = null,
  toggleLED = function(){},
  toggleState = false;


// Configure stuff

Instagram.set('client_id', config.instagram.client_id);
Instagram.set('client_secret', config.instagram.client_secret);
Instagram.set('callback_url', 'http://localhost:3000/callbacks');
Instagram.set('redirect_uri', 'http://localhost:3000/handleauth');

var url = Instagram.oauth.authorization_url({
  scope: 'comments likes', // use a space when specifying a scope; it will be encoded into a plus
  display: 'touch'
});

console.log(url);



// var FacebookSearch = require('facebook-search');

// var fb = new FacebookSearch('171614832991780', '1aff00f0278172cce6d624a25cc47677');
// var searchFor = {
//     type: 'post',
//     q: 'tweedie'
//     // center: '48.13708, 11.5756',
//     // distance: 1000
// };

// fb.search(searchFor, function(err, res) {
//     //console.log(err ? err : res);

//     foreach(a in res){
//       console.log(a.message);
//     }

//     // fb.next(function(err, res) {
//     //     console.log(err ? err : res);
//     // });
// });


//Instagram.set('maxSockets', 10);

// Instagram.tags.info({
//   name: 'blue',
//   complete: function(data){
//     console.log(data);
//   }
// });

//Instagram.tags.subscribe({ object_id: 'blue' });


// MongoClient.connect("mongodb://localhost:27017/DBvivid", function(err, db) {
//   if(!err) {1
//     console.log("VIVID DB connected");
//   }
// });

board.on('ready', function(){
 console.log('Board ready');

 Tweeter.Init({io: io});

 led = new five.Led(13);

 toggleLED = function(){
     led.on();

     setTimeout(function(){
        led.off();
     },700);
   }
});

// --- Routes -----------------------------------------------------------------+

app.all('/', routes.header);

// app.get('/', routes.index);
app.get('/', function(req,res){
    res.redirect(url);
});

app.get('/callbacks', function(req,res){
      
      Instagram.subscriptions.handshake(req, res); 
});

app.post('/callbacks', function(req,res){

      Instagram.subscriptions.handshake(request, response); 
});


app.get('/home', routes.index);

app.get('/subscribe', function(request, response){
  Instagram.subscriptions.handshake(request, response); 
});

app.get('/handleauth', function(request, response){
  Instagram.oauth.ask_for_access_token({
    request: request,
    response: response,
    redirect: 'http://localhost:3000/home', // optional
    complete: function(params, response){
      Instagram.set('access_token', params['access_token']);
      Instagram.set('verify_token', params['access_token']);

      console.log('Success token : ' +params['user'] + ' : ' + params['access_token']);
      //Instagram.subscriptions.handshake(request, response); 
      // console.log(Instagram.subscriptions.list()); // Notice the distinct lack of quotes around the user_Id

      Instagram.subscriptions.subscribe({ object: 'tag', object_id: 'blue', 
                                          verify_token: params['access_token'] });
      // params['access_token']
      // params['user']
      //response.writeHead(200, {'Content-Type': 'text/plain'});
      // or some other response ended with
      //response.end();
    },
    error: function(errorMessage, errorObject, caller, response){
      // errorMessage is the raised error message
      // errorObject is either the object that caused the issue, or the nearest neighbor
      // caller is the method in which the error occurred
      //response.writeHead(406, {'Content-Type': 'text/plain'});
      // or some other response ended with
      //response.end();
      console.log(errorMessage);
    }
  });
  return null;
});

app.get('/page/:page/:skip', routes.page);
app.use("/", express.static(__dirname + "/public/"));


// --- Socket.io events -----------------------------------------------------------------+

io.on('connection', function (socket) {

    console.log('user connected');
  	socket.emit('init', { message: 'init' , 
                          searchWords: Tweeter.SearchWords(), 
                          botActive: Tweeter.bot_on, 
                          interval: Tweeter.Interval});


    socket.on('toggleBot', function(data) {

      	var a = Tweeter.ToggleBot() ? 'ON' : 'OFF';
      	console.log('Twitter bot has been toggled: '.magenta + a.red );
    }); 

    socket.on('addSearchableWord', function(data) {
        Tweeter.AddWordToStream(data.word);
      	console.log('Adding "'.blue + data.word + '" to search words array'.blue);
    }); 

    socket.on('removeSearchableWord', function(data) {
      	Tweeter.RemoveWordFromStream(data.word);
        console.log('Removing "'.red + data.word + '" to search words array'.red);
    });

});

 
// --- Twitter -----------------------------------------------------------------+

Tweeter.Events.on('tweet', function(tweet) {toggleLED();});

// --- Server -----------------------------------------------------------------+

server.listen(port, function() {
  console.log('Listening on ' + port);
});
