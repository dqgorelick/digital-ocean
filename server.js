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

var sharkCount = 0;
var minnowCount = 0;
var gameRound = 0;
var canvas = {width: 1000, height: 1000};

//Game information
var serverGameBoard = {
  clients: {},
  canvas: canvas,
  sharkCount: sharkCount,
  minnowCount: minnowCount
};

io.on('connection', function(client) {
    client.id = UUID();
    // determine if client will be shark or minnow
    if (!gameRound && !sharkCount) {
      client.state="shark"
      client.speed=384;
      ++sharkCount;
    } else {
      client.state="minnow"
      client.speed=256;
      ++minnowCount;
    }
    var physics = generatePlayerPhysics(client.state);
    updatePlayer(client.id, client.state, 0, physics);
    logClients();
    //send client data
    io.emit('onconnected', createPlayer(client.id, client.state, physics));
    client.on('update', function(client) {
        //add client to appropriate objects
        updatePlayer(client.id, client.state, client.minnowsCaught, client.physics);
        io.emit('updatedBoard', serverGameBoard);
    })

    client.on('disconnect', function() {
        if(client.state == "shark") {
          --sharkCount;
        } else {
          --minnowCount;
        }
        delete serverGameBoard.clients[client.id];
        logClients();
    });
});

var createPlayer = function(id, state, physics) {
   return {id: id, state: state, minnowsCaught: 0, physics: physics}
}

var updatePlayer = function(id, state, minnowsCaught, physics) {
    var player = serverGameBoard.clients[id];
    //if player doesn't exist add them
    if(!player) {
      player = createPlayer(id, state, physics);
      minnowsCaught = 0;
      serverGameBoard.clients[id] = player;
    }

    if(player.state != state) {
      if(state == "shark") {
        --sharkCount;
        ++minnowCount;
      } else {
        --minnowCount;
        ++sharkCount;
      }
    }
    player.minnowsCaught = minnowsCaught;
    player.physics.x = physics.x;
    player.physics.y = physics.y;
}

var generatePlayerPhysics = function(state) {
    physics = {};
    physics.y = 32 + (Math.random() * (canvas.height - 64));
    if(state = "shark") {
      physics.speed = 384;
      physics.x = canvas.width-10;
    } else {
      physics.speed = 256;
      physics.x = 10;
    }
    return physics;
}

var logClients = function() {
  console.log("Logging players");
  console.log('active players: ' + JSON.stringify(serverGameBoard.clients));
}

http.listen(port, function() {
    console.log("[ SERVER ] Hosting server on port " + port);
});
