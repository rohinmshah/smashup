var express = require('express');
var app = express();
var _ = require('underscore');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var nodes = {};
var usernames = {};

server.listen(process.env.PORT || 3000);

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view options', { layout: false });

// Express stack

// Note: Since we add public first, we are assuming that these files
// are returned without any of the other middleware running, I think
app.use(express.static(__dirname + '/public'));
app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());

app.use(app.router);

app.get('/', function(request, response) {
    response.render('pages/index');
});

io.sockets.on('connection', function(socket) {
    socket.emit('updateusers', usernames);

    socket.on('sendchat', function (data) {
        io.sockets.emit('updatechat', socket.username, data);
    });

    socket.on('adduser', function(username) {
        socket.username = username;

        usernames[username] = username;

        socket.emit('servernotification', { connected: true, to_self: true, username: username });

        socket.broadcast.emit('servernotification', { connected: true, username: username });

        io.sockets.emit('updateusers', usernames);
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function(){
	if (socket.username !== undefined) {
            delete usernames[socket.username];

            io.sockets.emit('updateusers', usernames);

            socket.broadcast.emit('servernotification', { username: socket.username });
	}
    });
});
