var express = require("express");
var app = express();
var path = require("path");
var port = process.argv[2] || 8080;
var http = require('http').Server(app);
var io = require('socket.io')(http);
var UUID = require('node-uuid');

app.use(express.static(__dirname));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
//
// Array.prototype.remove = function() {
//     var what, a = arguments, L = a.length, ax;
//     while (L && this.length) {
//         what = a[--L];
//         while ((ax = this.indexOf(what)) !== -1) {
//             this.splice(ax, 1);
//         }
//     }
//     return this;
// };

//Game information
var serverGameBoard = {
    sharks: {},
    minnows: {}
}

var gameRound = 0;

io.on('connection', function(client) {
    var player = {};
    player.id = UUID();
    // determine if client will be shark or minnow
    if (!gameRound && !Object.keys(serverGameBoard.sharks).length) {
      player.state="shark"
    } else {
      player.state="minnow"
    }
    addPlayer(player);
    logClients();
    //send client data
    io.emit('onconnected', player );
    client.on('update', function(client) {
        //add client to appropriate objects
        console.log(client)
        addPlayer(client);
        io.emit('board state', serverGameBoard);
    })

    client.on('disconnect', function() {
        if(client.state == "shark") {
          serverGameBoard.sharks[client.userid] = null;
        } else {
          serverGameBoard.minnows[client.userid] = null;
        }
        logClients();
    });
});

var addPlayer = function(client) {
  console.log(client);
  if(client.state == "shark") {
    serverGameBoard.sharks[client.id] = client;
  } else {
    serverGameBoard.minnows[client.id] = client;
  }
}

var logClients = function() {
  console.log("Logging players");
  console.log('active minnows: ' + JSON.stringify(serverGameBoard.minnows));
  console.log('active sharks: ' + JSON.stringify(serverGameBoard.sharks));
}

http.listen(port, function() {
    console.log("[ SERVER ] Hosting server on port " + port);
});
