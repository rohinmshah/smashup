var express = require('express');
var app = express();
var _ = require('underscore');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var passport = require('passport');

var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var nodes = {};
var usernames = {};
var board = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]

server.listen(process.env.PORT || 3000);

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view options', { layout: false });

// Express stack

// Note: Since we add public first, we are assuming that these files
// are returned without any of the other middleware running, I think
app.use(express.static(__dirname + '/public'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({ secret: process.env.SESSION_SECRET }));

require('./config/passport.js')(passport);
app.use(passport.initialize());
app.use(passport.session());
require('./app/routes.js')(app, passport);

function enableChat(socket) {
    socket.on('sendchat', function (data) {
        io.sockets.emit('updatechat', socket.username, data);
    });
};

function enablePlay(socket) {
    socket.on('play', function (data) {
	console.log('Received play message with index ' + data.index);
	if (board[data.index]) {
	    board[data.index] = false;
	    io.sockets.emit('updategame', socket.username, data);
	    io.sockets.emit('sendchat', socket.username, 'Removed box ' + data.index)
	}
    });
};

io.sockets.on('connection', function(socket) {
    enablePlay(socket);
    socket.emit('updateusers', usernames);
    socket.emit('gamestate', board);

    socket.on('adduser', function(username) {
        socket.username = username;
        usernames[username] = username;

        socket.emit('servernotification', { connected: true, to_self: true, username: username });

	// Send to all connected sockets EXCEPT socket
        socket.broadcast.emit('servernotification', { connected: true, username: username });

	// Send to all connected sockets
        io.sockets.emit('updateusers', usernames);

        enableChat(socket);
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
