var http = require('request');
var rp = require('request-promise');
var scramble = require('../scramble.js');

module.exports = function (app, addon) {
  var hipchat = require('../lib/hipchat')(addon);

  // Root route. This route will serve the `addon.json` unless a homepage URL is
  // specified in `addon.json`.
  app.get('/',
    function(req, res) {
      // Use content-type negotiation to choose the best way to respond
      res.format({
        // If the request content-type is text-html, it will decide which to serve up
        'text/html': function () {
          res.redirect(addon.descriptor.links.homepage);
          // res.redirect('/atlassian-connect.json');
        },
        // This logic is here to make sure that the `addon.json` is always
        // served up when requested by the host
        'application/json': function () {
          res.redirect('/atlassian-connect.json');
        }
      });
    }
    );

  // This is an example route that's used by the default for the configuration page
  app.get('/config',
    // Authenticates the request using the JWT token in the request
    addon.authenticate(),
    function(req, res) {
      // The `addon.authenticate()` middleware populates the following:
      // * req.clientInfo: useful information about the add-on client such as the
      //   clientKey, oauth info, and HipChat account info
      // * req.context: contains the context data accompanying the request like
      //   the roomId
      console.log('CHECK CONFIG ----------------------------------------');  
      console.log(req.query);
      console.log('END CHECK CONFIG ----------------------------------------');
  // console.log(req.clientInfo.clientKey);
  // var test = addon._jwt.decode(req.query.signed_request, req.clientInfo.clientKey, false);
      // res.render('config', req.context);
      res.render('config', res);
    }
    );

  // This is an example route to handle an incoming webhook
  app.post('/webhook',
    addon.authenticate(),
    function(req, res) {
      hipchat.sendMessage(req.clientInfo, req.context.item.room.id, 'pong')
      .then(function(data){
        res.send(200);
      });
    }
    );

    app.post('/scramble-start',
    addon.authenticate(),
    function(req, res){
      console.log(req.context.item);
      var command = req.context.item.message.message;
      var category = command.split(/[\s-]+/);
      var msg = "";

      
      if(scramble.isCategory(category[category.length-1])){
        msg = category[category.length-1];
      }

      var scrambledWord = scramble.getScramble(msg);

      if(msg === "")msg = scrambledWord.category;

      hipchat.sendMessage(req.clientInfo, req.context.item.room.id, 'Starting "'+ msg +'" game of Scramble.', 
        {
          options: {
          color:"green", "notify":true
          }
        })
      .then(function(data){
        
        console.log('SCRAMBLED WORD:');
        console.log(GLOBAL.clientInfo);

        hipchat.sendMessage(GLOBAL.clientInfo, req.context.item.room.id, scrambledWord.scramble + '')
        .then(function(data2){
          console.log(data2);
          console.log('DONE!!!');
            res.send(200);
        });
        
      });
    });


app.post('/scramble-stop',
  addon.authenticate(),
  function(req, res){
    console.log('CHECK REQUEST ----------------------------------------');
    console.log(req.context);
    hipchat.sendMessage(req.clientInfo, req.context.item.room.id, 'Cancelling game of Scramble', 
    {
      options: {
        color:"red", notify:false}
      })
    .then(function(data){
      res.send(200);
    });
  });

app.post('/scramble-pause',
  addon.authenticate(),
  function(req, res){
    console.log('CHECK REQUEST ----------------------------------------');
    console.log(req.context);
    hipchat.sendMessage(req.clientInfo, req.context.item.room.id, 'Pausing game of Scramble')
    .then(function(data){
      res.send(200);
    });
  });

  // Notify the room that the add-on was installed
  addon.on('installed', function(clientKey, clientInfo, req){
    GLOBAL.clientInfo = clientInfo;
    hipchat.sendMessage(clientInfo, req.body.roomId, 'The ' + addon.descriptor.name + ' add-on has been installed in this room');
  });

  // Clean up clients when uninstalled
  addon.on('uninstalled', function(id){
    addon.settings.client.keys(id+':*', function(err, rep){
      rep.forEach(function(k){
        addon.logger.info('Removing key:', k);
        addon.settings.client.del(k);
      });
    });
  });
};
