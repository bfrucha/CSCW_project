var dnode = require('dnode');

// Connect to server
var d = dnode.connect(5004);

// Server is ready
d.on('remote', function (remote) {
    remote.listFiles('.', function (s) {
        console.log(s.join('\n'));
        // Close connection
        d.end();
    });
});
