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
    this.sharkCount = 0;
    this.minnowCount = 0;
    this.gameRound = 0;
    this.canvas = {
        width: 750,
        height: 450
    }
}

//Game information
var clients = {};
var players = [];
var active = 0;

io.on('connection', function(socket) {
    active++;
    console.log("active users", active);

    clientID = socket.id;
    // console.log(clientID);
    io.emit('onconnected', clients);
    io.emit('user-id', clientID);
    socket.on('client update', function(update) {
        clients[clientID] = update;
        io.emit('server update', clients)
    })
    socket.on('disconnect', function() {
        delete clients[clientID];
        active--;
        console.log("active users", active);
    })
});

http.listen(port, function() {
    console.log("[ SERVER ] Hosting server on port " + port);
});


