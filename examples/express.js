// Create Express app
var express = require('express');
var app = express();

// Serve / 
app.get('/', function (req, res) {
  res.send('Hello World!');
});

// Start the server
var server = app.listen(8080, function () {
  console.log('Server listening at http://localhost:%s', server.address().port);
});
