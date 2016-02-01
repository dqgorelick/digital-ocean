var express = require("express");
var app = express();
var path = require("path");
var port = process.argv[2] || 8080;
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
	res.render('index');
});

app.post('/', function(req, res) {
	var username = req.body.username;
	var controls = req.body.controls;
	res.redirect('/game/' + username + '/' + controls);
});

app.get('/game/:username/:controls', function(req, res) {
	var username = req.params.username;
	var controls = req.params.controls;
	res.render('game', {username: username, controls: controls});
});

Game = function () {
    this.users = 0;
    this.sharkCount = 0;
    this.minnowCount = 0;
    this.gameRound = 0;
    this.canvas = {
        width: 750,
        height: 450
    }
    this.safezoneWidth = 50;
    this.waiting = true;
    this.timer = 4;
    this.status = null;
}

//Game information
var clients = {};
var board = new Game();

io.on('connection', function(socket) {
    board.users++;
    update();
    var clientID = socket.id;

    io.emit('onconnected', clients);
    io.emit('user-id', clientID);
    socket.on('client update', function(update) {
        clients[clientID] = update;
        if (!board.waiting && clients[clientID].isSafe && safePlayers.indexOf(clientID) === -1) {
            safePlayers.push(clientID);
            // remaining--;
        }
        if(!clients[clientID].isAlive && deadPlayers.indexOf(clientID) === -1) {
            // console.log(clientID + " added to dead fish array")
            deadPlayers.push(clientID);
            remaining--;
            // console.log("before", allPlayers);
            allPlayers.splice(allPlayers.indexOf(clients[clientID].username),1);
            // console.log("after", allPlayers);
        }
        io.emit('server update', clients)
    })
    socket.on('join', function(player){
        if(player.fishType == "shark") {
            // console.log("shark spawns");
            board.sharkCount++;
        }
        if(player.fishType == "minnow") {
            // console.log("minnow spawns")
            board.minnowCount++;
            // console.log("pushed " + player.username + " to the list");
            allPlayers.push(player.username);
        }

    })
    socket.on('disconnect', function() {
        io.emit('remove player', clientID);
        // console.log("removing", clientID);
        delete clients.clientID;
        board.users--;
    })
});

var safePlayers = [];
var remaining = 9999;
// fish dying logic
var deadPlayers = [];
var allPlayers = [];

var nextRound = false;
if (nextRound) {
    nextRound = false;
    board.Reset();
}


var nextSecond = true;
var startCountdown = false;
var countingDown = false;
var roundBegin = false;
var toNextRound = true;
function update() {
    board.status = "Waiting for a minnow to join to start the round!";
    if(board.minnowCount > 0){
        startCountdown = true;
    }
    if(countingDown && !roundBegin){
        board.status="Next round starts in: " + board.timer;
    }
    if (startCountdown) {
        countingDown = true;
        if(nextSecond && board.timer > 0) {
            board.timer--;
            nextSecond = false;
            setTimeout(function(){
                nextSecond = true;
            },1000);
            if (board.timer === 0 && board.waiting) {
                countingDown = false;
                startCountdown = false;
                board.waiting = false;
                roundBegin = true;
                toNextRound = true;
                remaining = board.minnowCount;
                // console.log(remaining, " IS REMAINING");
                board.gameRound++;
            }
        }
    }
    if (roundBegin) {
        board.status = "It's a digital ocean brawl!";
    }
    if(remaining === 1 && toNextRound) {
        // toNextRound = false;
        // console.log("last one is ", allPlayers);
        board.status = "FIGHT TO THE DEATH";
        board.waiting = true;
        // roundBegin = false;
        // board.timer = 3;
        // countingDown = true;
        // for(var i = 0; i < safePlayers.length ; i++) {
            // this.sharkCount = 0;
            // this.minnowCount = 0;

        // }
    }
    if (allPlayers.length === 1) {
        board.status = "Last one standing: " + allPlayers[0];
    }
    setTimeout(update, 1000/5);
    io.emit('status update', board);
    io.emit('dead players', deadPlayers);
    io.emit('all players', allPlayers);

}

http.listen(port, function() {
    console.log("[ SERVER ] Hosting server on port " + port);
});


