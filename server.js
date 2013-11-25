var express = require('express');
var socket = require('socket.io');
var http = require('http');
var util = require('util')
var exec = require('child_process').exec;
var RserveInterface = require('./js/RserveInterface.js');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var rServInterface = new RserveInterface();

// Configure the server to use static content
app.configure(function () {
	app.use(
		"/", //the URL throught which you want to access to you static content
		express.static(__dirname) //where your static content is located in your filesystem
	);
});

server.listen(8082);
console.log("Started listening on Port 8082");

// Handle Client connection
var clientConnectedCount = 0;
io.sockets.on('connection', function (socket) {
	
	// Increase Client counter and start RServe if necessary
	clientConnectedCount++;
	console.log("Client connected, Number of connected Clients: " + clientConnectedCount);

	if (clientConnectedCount > 0)
		rServInterface.serverIsRunning(function(isRunning){
			if (!isRunning) {
				console.log("Starting Rserve");
				rServInterface.startServer();
			}
			else
				console.log("RServe is already running");
		});

	socket.on('evaluateTerm', function (data) {
		rServInterface.evaluateTerm(data.term, function(result){
			io.sockets.emit('termEvaluated', result);
		});
	});

	socket.on('disconnect', function () {
		clientConnectedCount--;
		console.log("Client disconnected, Number of connected Clients: " + clientConnectedCount);
		if (clientConnectedCount == 0){
			console.log("No client connected anymore, closing RServe");
			rServInterface.stopServer();
		}
	});
});