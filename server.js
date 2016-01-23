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

//Game information
var serverGameBoard = {
  clients: {}
};

var sharkCount = 0;
var gameRound = 0;

io.on('connection', function(client) {
    client.id = UUID();
    // determine if client will be shark or minnow
    if (!gameRound && !sharkCount) {
      client.state="shark"
      ++sharkCount;
    } else {
      client.state="minnow"
    }
    updatePlayer(client.id, client.state, 0);
    //send client data
    io.emit('onconnected', {id: client.id, state: client.state, minnowsCaught: 0});
    client.on('update', function(client) {
        //add client to appropriate objects
        updatePlayer(client.id, client.state, client.minnowsCaught);
        io.emit('board state', serverGameBoard);
    })

    client.on('disconnect', function() {
        if(client.state == "shark") {
          --sharkCount;
        }
        updatePlayer(client.id, null, 0);
    });
});

var updatePlayer = function(id, state, minnowsCaught) {
  if(state) {
    //if player doesn't exist add them
    if(!serverGameBoard.clients[id]) {
      serverGameBoard.clients[id] = {};
      serverGameBoard.clients[id].state = state;
    }
    serverGameBoard.clients[id].minnowsCaught = minnowsCaught;
  } else {
    //remove player if no state
    serverGameBoard.clients[id] = undefined;
  }
  logClients();
}

var logClients = function() {
  console.log("Logging players");
  console.log('active players: ' + JSON.stringify(serverGameBoard.clients));
}

http.listen(port, function() {
    console.log("[ SERVER ] Hosting server on port " + port);
});
