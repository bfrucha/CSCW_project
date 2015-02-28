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

	// Listen to disconnections
	client.on('disconnect', function() {
		console.log('A user disconnected');
	});
});

// Start the server (NOTE: user http.listen, NOT app.listen!!)
var server = http.listen(8080, function () {
  console.log('Server listening at http://localhost:%s', server.address().port);
});

