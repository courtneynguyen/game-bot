var http = require('request');
var rp = require('request-promise');

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

  app.get('/test', function(req, res){


    res.send(hipchat);
    // console.log('WHAT IS HOST????');
    // console.log(host_name);
    // console.log(auth_token);
    // console.log(roomId);
    // rp.post({
    //   method:'POST',
    //   uri: host_name+"/room/"+roomId+"/notification",
    //   qs: {
    //     auth_token: auth_token
    //   },
    //   json: {
    //     message:"HELLO WORLD",
    //     color:"red",
    //     message_format:"text",
    //     notify:"true"
    //   }
    // })
    // .then(function(res){
    //   res.send("sent");
    // })
    // .catch(function(data){
    //   res.send(data);
    // });
  });

  // Notify the room that the add-on was installed
  addon.on('installed', function(clientKey, clientInfo, req){
    addon.config.client = clientInfo;
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
