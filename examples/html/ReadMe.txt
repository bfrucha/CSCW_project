ReadMe for Web-based tools for Groupware

Before running any of the demos, you need to install [node.js](nodejs.org).
This will install the *node* application, as well as the *npm* package manager.
Then you need to install several *npm* packages:

    % node install express
    % node install socket.io
    % node install dnode

-- 1 -- Events
	% node node-events.js
	You can also simply run node to get the interactive mode
	and paste the lines one by one

-- 2 -- Express web server
	% node express.js
	open http://localhost:8080/ in browser

-- 3 -- Express web server
	% node express2.js
	open http://localhost:8080/index.html in browser

-- 4 -- Simple chat
	% node chat.js
	open http://localhost:8080/test.html in browser
		see connect/disconnect messages from the server
		test automatic reconnection when killing and restarting the server

-- 5 -- Simple chat
	% node chat2.js
	open http://localhost:8080/chat.html in 2 (or more) browser windows
		enter user name and click Connect in each window
		send messages
		close one window and see notification
		kill and restart server to see reconnection

-- 6 -- ShareJS
	open two windows on http://sharejs.org
	and edit the textarea at the top of the page

-- 7 -- DNode
	% node dnode-server.js

	[in another terminal window:]
	% node dnode-client.js
		the server lists the files and sends them to the client

-- 8 -- Node-Webkit
	For this demo you need to install [node-webkit](http://nwjs.io) (recently renamed nw).
	On Linux and Windows:
		% cd nw-demo
		% nw .
			displays the list of files, normally inaccessible to a browser
	On Macintosh:
		% open -a nwjs --args `pwd`/nw-demo

-- 9 -- WebRTC
For this demo use Chrome or Firefox
	https://github.com/webrtc/samples
	http://webrtc.github.io/samples/src/content/peerconnection/pc1/

