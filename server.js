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

var GB = {
    clients: {},
    active: [],
}

io.on('connection', function(client) {
    client.userid = UUID();
    GB.active.push(client.userid);
    console.log('active clients: ' + GB.active);
    // give client their ID
    io.emit('onconnected', { id: client.userid } );
    client.on('update', function(player) {
        GB.clients[player.id] = player;
        io.emit('board state', GB);
    })
    client.on('disconnect', function() {
        GB.active.remove(client.userid);
        console.log('active clients: ' + GB.active);
    });
    // client.on('chat message', function(msg) {
    //     console.log('message: ' + msg);
    //     io.emit('chat message', msg);
    // });
});


http.listen(port, function() {
    console.log("[ SERVER ] Hosting server on port " + port);
});
