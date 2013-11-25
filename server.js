var express = require('express');
var socket = require('socket.io');
var Rserve = require('./lib/rserve-js/main.js');
var http = require('http');
var util = require('util')
var exec = require('child_process').exec;

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// Configure the server to use static content
app.configure(function () {
	app.use(
		"/", //the URL throught which you want to access to you static content
		express.static(__dirname) //where your static content is located in your filesystem
	);
});

server.listen(8082);
console.log("Started listening on Port 8082");
var rserveHandler = new RserveHandler();

/**
Helper Function to execture local command
**/
function execCommand(command, onSuccessCallback, onErrorCallback) {
	console.log("Executing command '" + command + "'");
	exec(command,
		function (error, stdout, stderr) {
			//console.log('stdout: ' + stdout);
			//console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
				if (onErrorCallback != undefined)
					onErrorCallback(error);
			}
			// Run Success Callback if specified
			if (onSuccessCallback != undefined)
				onSuccessCallback(stdout);
	});
}

// Handle Client connection
var clientConnectedCount = 0;
io.sockets.on('connection', function (socket) {
	
	// Increase Client counter and start RServe if necessary
	clientConnectedCount++;
	console.log("Client connected, Number of connected Clients: " + clientConnectedCount);

	if (clientConnectedCount > 0)
		rserveHandler.serverIsRunning(function(isRunning){
			if (!isRunning) {
				console.log("Starting Rserve");
				execCommand('cd "./lib/rserve-js/tests/" && R --slave --no-restore --vanilla --file="r_files/regular_start.R"');
			}
			else
				console.log("RServe is already running");
		});
		// execCommand('killall Rserve && cd "./lib/rserve-js/tests/" && R --slave --no-restore --vanilla --file="r_files/regular_start.R"');

	socket.on('evaluateTerm', function (data) {
		evaluateTerm(data.term, function(result){
			io.sockets.emit('termEvaluated', result);
		});
	});

	socket.on('disconnect', function () {
		clientConnectedCount--;
		console.log("Client disconnected, Number of connected Clients: " + clientConnectedCount);
		if (clientConnectedCount == 0){
			console.log("No client connected anymore, closing RServe");
			execCommand('killall Rserve');
		}
	});
});

function evaluateTerm(term, callback)
{
	var s = Rserve.create({
		host: 'http://127.0.0.1:8081',
		on_connect: function() {
			result = s.eval(term, function(result){
				callback(result);
			});
		},
		on_close: function(msg) {
			console.log("Socket closed. (!?)");
			console.log(msg);
		}
	});
}

// RServeHandler Class ------------------------
function RserveHandler() {}

RserveHandler.prototype.serverIsRunning = function (callback){
	execCommand("pgrep Rserve", function(result){
		if (result == "")
			callback(false);
		else
			callback(true);
	});
}