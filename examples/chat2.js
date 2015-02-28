// Create Express app
var express = require('express');
var app = express();

// Get the http server created by Express
var http = require('http').Server(app);
// Load socket.io
var io = require('socket.io')(http);

// Serve / 
app.get('/', function (req, res) {
  res.sendFile(__dirname + "/html/test.html");
});

// Serve static pages from the html directory
app.use('/', express.static(__dirname + '/html'));

// Listen to socket connections
io.on('connection', function(client) {
	console.log('A user connected');
	var user = 'unknown';

	// Listen to disconnections
	client.on('disconnect', function() {
		console.log(user, 'disconnected');
		io.emit('bye', user);
	});

	// Listen to client messages
	client.on('hello', function(name) {
		console.log(name, 'joined');
		user = name;
		// Broadcast to others
		client.broadcast.emit('hello', name);
	});
	client.on('msg', function(data) {
		console.log(data);
		// Broadcast to others
		client.broadcast.emit('msg', data);
	});
});

// Start the server (NOTE: user http.listen, NOT app.listen!!)
var server = http.listen(8080, function () {
  console.log('Server listening at http://localhost:%s', server.address().port);
});

