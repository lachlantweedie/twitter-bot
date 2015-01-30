//var //JSX = require('node-jsx').install(),
  //React = require('react'),
  //TweetsApp = require('./components/TweetsApp.react'),
  //Tweet = require('./models/Tweet');
var path = require('path');


module.exports = {

  header: function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      next();
  },

  index: function(req, res) {
      res.sendFile(path.resolve('public/index.html'));
  },

  callbacks: function(req, res) {

      
  },

  handleAuth: function(req, res) {
      console.log(req);
  },

  page: function(req, res) {
    
  }

  // authorize_user : function(req, res) {
  //   res.redirect(ig.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
  // },

  // handleauth : function(req, res) {
  //   ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
  //     if (err) {
  //       console.log(err.body);
  //       res.send("Didn't work");
  //     } else {
  //       ig.subscriptions(function(err, subscriptions, remaining, limit){
  //         console.log(subscriptions);
  //       });
  //       //ig.use({ access_token: result.access_token });
  //     //  console.log('Yay! Access token is ' + result.access_token);
  //       // res.send('You made it!!');
  //       //ig.add_tag_subscription('funny', 'http://localhost:3000/newtag', [result.access_token], function(err, result, remaining, limit){console.log(err);});
  //       res.redirect('http://localhost:3000');
  //     }
  //   });
  // },

  // get_ig : function() {
  //   return ig;
  // }

}