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
    this.clients = clients;
    this.canvas = {
        width: 750,
        height: 450
    }
}

//Game information
var clients = {};
var board = new Game();

io.on('connection', function(socket) {
    board.users++;
    console.log("active users", board.users);
    update();
    clientID = socket.id;
    console.log("adding", clientID);
    // console.log(clientID);
    io.emit('onconnected', clients);
    io.emit('user-id', clientID);
    socket.on('client update', function(update) {
        clients[clientID] = update;
        io.emit('server update', clients)
    })
    socket.on('disconnect', function() {
        io.emit('remove player', clientID);
        console.log("removing", clientID);
        delete clients.clientID;
        board.users--;
        console.log("active users", board.users);
    })
});

function update() {
    io.emit('status update', board);
    setTimeout(update, 1000/5);
}

http.listen(port, function() {
    console.log("[ SERVER ] Hosting server on port " + port);
});


