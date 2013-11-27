var express = require('express');
var socket = require('socket.io');
var http = require('http');
var util = require('util')
var exec = require('child_process').exec;
var RserveInterface = require('./js/RserveInterface.js');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var rServeInterface = new RserveInterface();

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

	if (clientConnectedCount > 0) {
		rServeInterface.connectToRServeAsync(function(){
			// DEBUG
			// rServeInterface.evaluateTermAsync("setwd('~/Sites/d3-playground/interactionGraph')", function(){
			// 	rServeInterface.evaluateTermAsync("csv <- read.csv('SHIP_2012_82_D_S2_20121129.csv')");
			// });
		});
	}

	socket.on('evaluateTerm', function (data) {
		rServeInterface.evaluateTermAsync(data.term, function(result){
			io.sockets.emit('termEvaluated', result);
		});
	});

	socket.on('disconnect', function () {
		clientConnectedCount--;
		console.log("Client disconnected, Number of connected Clients: " + clientConnectedCount);
		if (clientConnectedCount == 0){
			console.log("No client connected anymore, closing RServe");
			rServeInterface.stopServerAsync();
		}
	});
});

// Helper Functions
/*
 * Override Log Function to include Timestamp
 */
console.logCopy = console.log.bind(console);
console.log = function(data) {
	var currentDate = new Date();
	var display = "[" + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds() + "." + currentDate.getMilliseconds() + "]";
	this.logCopy(display, data);
	// var currentDate = '[' + new Date().toUTCString() + '] ';
	// this.logCopy(currentDate, data);
};