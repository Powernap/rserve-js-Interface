var RserveInterface = (function() {

	var exec = require('child_process').exec;
	var Rserve = require('../lib/rserve-js/main.js');

	var localConnection = undefined;

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

	// Constructor
	var RserveInterface = function(options) {
		
	};

	RserveInterface.prototype.foo = function foo() {
		execCommand('ls');
	};

	RserveInterface.prototype.serverIsRunning = function (callback){
		execCommand("pgrep Rserve", function(result){
			if (result == "")
				callback(false);
			else
				callback(true);
		});
	}

	RserveInterface.prototype.stopServer = function(){
		execCommand('killall Rserve');
	}

	RserveInterface.prototype.startServer = function(){
		execCommand('cd "./lib/rserve-js/tests/" && R --slave --no-restore --vanilla --file="r_files/regular_start.R"');
		setTimeout(function() {
			localConnection = Rserve.create({
				host: 'http://127.0.0.1:8081',
				on_close: function(msg) {
					console.log("RServ Socket closed");
					console.log(msg);
				}
			});
			console.log("-------RserveInterface.prototype.startServer--------");
			console.dir(localConnection);
			console.log("---------------");
		}, 1000)
	}

	function openRServeConnection(){
		localConnection = Rserve.create({
			host: 'http://127.0.0.1:8081',
			on_close: function(msg) {
				console.log("RServ Socket closed");
				console.log(msg);
			}
		});
		console.log("-------RserveInterface.prototype.startServer--------");
		console.dir(localConnection);
		console.log("---------------");
	}

	RserveInterface.prototype.evaluateTerm = function(term, callback)
	{
		//console.dir(localConnection);
		localConnection.eval(term, function(result){
			callback(result);
		});
	}

	return RserveInterface;
})();

module.exports = RserveInterface;