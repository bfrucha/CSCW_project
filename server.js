// Create Express app
var express = require('express');
var app = express();

// Get the http server created by Express
var http = require('http').Server(app);
// Load socket.io
var io = require('socket.io')(http);


// write temporary files
var fs = require('fs');

// execute command lines
var exec = require("child_process").exec;

// Serve / 
app.get('/', function (req, res) {
  res.sendFile(__dirname + "/html/main.html");
});

// Serve static pages from the html directory
app.use('/', express.static(__dirname + '/'));
app.use('/libs', express.static(__dirname + '/libs'));
app.use('/css', express.static(path.resolve(__dirname + '/../css')));

// Listen to socket connections
io.on('connection', function(client) {
    console.log('A user connected');
    
    client.on('run', function(data) {
        
        var filename = "tmp/user1.py";

        fs.writeFile(filename, data.code, function(err) {
            if(err) { console.log(err); }
            else { 
                exec("python3.3 "+filename, function(error, stdout, stderr) {
                    console.log('Results : ' + stdout + '\nJS errors : ' + error + '\nSystem error : ' + stderr);
                    
                    client.emit('interpreted', { stdout: stdout, error: error, stderr: stderr });
                });
            }
        });

        
    });
});

// Start the server (NOTE: user http.listen, NOT app.listen!!)
var server = http.listen(8080, function () {
  console.log('Server listening at http://localhost:%s', server.address().port);
});

