var dnode = require('dnode');
var fs = require('fs'); // node module in HTML file!

function lsdir(path, cb) {
}

// Define the functions that can be remote called
var server = dnode({
    listFiles : function (path, cb) {
    	console.log('server: listing', path);
    	fs.readdir(path || '.', function(err, files) {
    		cb(files);
    	});	
    }
});

// Start the server
server.listen(5004);
