// Load events module
var Emitter = require('events').EventEmitter;
// Create an emitter
var chatRoom = new Emitter();
// Array for the participants
var participants = [];

// Say hello when new participant joins
chatRoom.on('hello', function(name) {
    console.log(name, 'says Hi!');
});

// Store name of participant
chatRoom.on('hello', function(name) {
    participants.push(name); 
});

// A new participant arrives
chatRoom.emit('hello', 'Alice');
