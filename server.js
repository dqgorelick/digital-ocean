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
	res.render('join');
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

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

var server_GB = {
    clients: {},
    active : []
}

io.on('connection', function(client) {
    client.userid = UUID();
    server_GB.active.push(client.userid);
    console.log('active clients: ' + server_GB.active.length);
    // give client their ID

    io.emit('onconnected', { id: client.userid, state: server_GB } );
    client.on('update', function(player) {
        server_GB.clients[player.id] = player;
        io.emit('board state', server_GB);
    })

    client.on('disconnect', function() {
        server_GB.active.remove(client.userid);
        console.log('active clients: ' + server_GB.active.length);
    });
});


http.listen(port, function() {
    console.log("[ SERVER ] Hosting server on port " + port);
});
