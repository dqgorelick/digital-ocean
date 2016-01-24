var express = require("express");
var app = express();
var path = require("path");
var port = process.argv[2] || 8080;
var http = require('http').Server(app);
var io = require('socket.io')(http);
var UUID = require('node-uuid');
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


//Game information
var clients = {};
var active = 0;

io.on('connection', function(client) {
    active++;
    console.log("active users", active);

    clientID = UUID();
    // console.log(clientID);
    io.emit('onconnected', clients);
    io.emit('user-id', clientID);
    client.on('client update', function(update) {
        clients[clientID] = update;
        io.emit('server update', clients)
    })
    client.on('disconnect', function() {
        delete clients[clientID];
        active--;
        console.log("active users", active);
    })
});

http.listen(port, function() {
    console.log("[ SERVER ] Hosting server on port " + port);
});
