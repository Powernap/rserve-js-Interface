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

/**
Helper Function to execture local command
**/
function execCommand(command) {
	console.log("Executing command '" + command + "'");
	exec(command,
		function (error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
			}
	});
}

// Handle Client connection
io.sockets.on('connection', function (socket) {
	socket.on('startRServ', function (){
		execCommand('killall Rserve && cd "./lib/rserve-js/tests/" && R --slave --no-restore --vanilla --file="r_files/regular_start.R"');
	});

	socket.on('evaluateTerm', function (data) {
		evaluateTerm(data.term, function(result){
			io.sockets.emit('termEvaluated', result);
		});
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