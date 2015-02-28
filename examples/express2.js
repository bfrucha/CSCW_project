// Create Express app
var express = require('express');
var app = express();

// Serve / 
app.get('/', function (req, res) {
  res.sendfile(__dirname + "/html/index.html");
});

// Serve static pages from the html directory
app.use('/', express.static(__dirname + '/html'));

// Start the server
var server = app.listen(8080, function () {
  console.log('Server listening at http://localhost:%s', server.address().port);
});

