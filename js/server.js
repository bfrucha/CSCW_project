/** NODE.JS REQUIREMENTS **/

// Create Express app
var express = require('express');
var app = express();

// Get the http server created by Express
var http = require('http').createServer(app);
// Load socket.io
var io = require('socket.io')(http);

// deal with relative path
var path = require('path');

// write temporary files
var fs = require('fs');

// execute command lines
var exec = require("child_process").exec;

// collaborative editing server
var sharejs = require('share').server;

// var livedb = require('livedb');
// var db = require('livedb-mongo')('localhost:27017/test?auto_reconnect', {safe:true});
// var backend = livedb.client(db);
// var share = require('share').client;

/****/


/** SERVER CONFIGURATION **/

// Serve / 
app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + "/../html/index.html"));
});

// Serve static pages from the html directory
app.use('/', express.static(__dirname + '/'));
app.use('/libs', express.static(__dirname + '/libs'));
app.use('/css', express.static(path.resolve(__dirname + '/../css')));
app.use('/tmp', express.static(path.resolve(__dirname + '/../tmp')));


var options = {db:{type:'none'}}; // See docs for options. {type: 'redis'} to enable     persistance.

// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.attach(app, options);

var clientsConnected = 0;
var messages = [];

var codes = { "Hello" : "" };
var fileInUse = "Hello";

// Listen to socket connections
io.on('connection', function(client) {
    clientsConnected++;

    // warn other users of a new connection
    client.broadcast.emit("connection", clientsConnected);

    // update created files
    for(var filename in codes) { client.emit("new_file", filename); } 
    
    // select current edited file
    client.emit("focus_file", fileInUse);
    
    // update clients connected number
    client.emit("update", { oldMessages : messages, clientsConnected : clientsConnected });
    
    // called when the client leaves the page
    client.on("disconnection", function(name) {
        clientsConnected--;
        client.broadcast.emit("disconnection", { name: name, clientsConnected: clientsConnected });
    });
    
    // run the python code on user call
    client.on('run', function(code) {
        codes[fileInUse] = code;

        for(var filename in codes) { 
            var path = "../tmp/"+filename+".py";

            fs.writeFile(path, codes[filename], function(err) {
                if(err) { console.log(err); }
            });
        } 

        exec("python3.3 ../tmp/"+fileInUse+".py", function(error, stdout, stderr) {
            // console.log(data.code);
            
            client.emit('interpreted', { stdout: stdout, stderr: stderr, error: error });
            
            // console.log(error);
        });
    });
       

    // send chat message
    client.on('message', function(data) {
        // console.log(data);
        messages[messages.length] = data.from + " : " + data.msg;
        
        client.broadcast.emit("message", data);
    });

    // create a new file in the list
    client.on("create_file", function(filename) {
        createDefaultFile();
    });

    client.on("select_file", function(data) {
        if(codes[data.filename] === undefined) { console.log("File not found : " + data.filename); }
        else {
            codes[fileInUse] = data.oldCode;
            
            fileInUse = data.filename;

            // request all clients to change their focus
            io.emit("focus_file", fileInUse);

            // only one client should change the editor's value
            client.emit("update_editor", codes[fileInUse]);
        }
    });


    // delete the selected file
    client.on('delete', function(filename) {
        // always keep a file open
        if(Object.keys(codes).length > 1) {
            delete codes[filename];
            
            io.emit('delete_file', filename);
            
            // change focus if deleted current file
            if(fileInUse === filename) { 
                for(var filename in codes) {
                    client.emit('update_editor', codes[filename]);
                    io.emit('focus_file', filename);
                    break;
                }
            }
        }
    });

    client.on('rename', function(names) {
        if(codes[names.newName] === undefined) {
            codes[names.newName] = codes[names.oldName];
            delete codes[names.oldName];
            
            io.emit('rename_file', { oldName: names.oldName, newName: names.newName });
        } else {
            client.emit('rename_file', { oldName: names.oldName, newName: names.oldName });
        }
    });
});


// Start the server (NOTE: user http.listen, NOT app.listen!!)
var server = http.listen(8080, function () {
  console.log('Server listening at http://localhost:%s', server.address().port);
});

/****/



/** FUNCTIONS DECLARATIONS **/

// function called when user clicks on "+" button
function createDefaultFile() {
    var filename = "NewFile";

    var index = 2;
    while(codes[filename] !== undefined) { filename = "NewFile" + index; index++; }
    
    codes[filename] = "";

    io.emit("new_file", filename);
}
