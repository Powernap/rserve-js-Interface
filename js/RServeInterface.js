var RserveInterface = (function() {

	var exec 	= require('child_process').exec;
	var Rserve = require('../lib/rserve-js/main.js');

	var localConnection = undefined;
	var _pathToRServJS = undefined

	// Constructor
	var RserveInterface = function(pathToRServJS) {
		_pathToRServJS = pathToRServJS;
	};
	
	/**
	Helper Function to execture local command
	**/
	function execCommandAsync(command, onSuccessCallback, onErrorCallback) {
		console.log("Executing command '" + command + "'");
		exec(command,
			function (error, stdout, stderr) {
				console.log(command + ' stdout: ' + stdout);
				console.log(command + ' stderr: ' + stderr);
				if (error !== null) {
					//console.log(error);
					if (onErrorCallback != undefined)
						onErrorCallback(error);
				}
				// Run Success Callback if specified
				if (onSuccessCallback != undefined)
					onSuccessCallback(stdout);
		});
	}

	/*
	 * Checks if RServe is running as local process and runs a
	 * callback with a boolean indicator for it
	 */
	function serverIsRunningAsync(callback){
		execCommandAsync("pgrep Rserve", function(result){
			if (result == "")
				callback(false);
			else
				callback(true);
		});
	}

	/*
	 * Open Channel to local RServe process and run the callback
	 * if the connection could be established successfully
	 */
	function openChannel(callback) {
		console.log("Opening channel to RServe");
		if (localConnection == undefined || localConnection.closed == true) {
			localConnection = Rserve.create({
				host: 'http://127.0.0.1:8081',
				on_close: function(msg) {
					console.log("RServe Socket closed");
					//console.log(msg);
				}
			});
			// Check if Channel is open and run
			var maximumWaitingTime = 500;
			var currentWaitingTime = 0;
			var waitingInterval = 0;
			var interval = setInterval(function(){
				if (localConnection.running){
					console.log("Channel to RServe open");
					clearInterval(interval);
					if (callback != undefined)
						callback();
				}
				// Stop if it takes to long
				if (currentWaitingTime > maximumWaitingTime){
					clearInterval(interval);
					console.log("Channel to RServe could not be opened");
				}
				currentWaitingTime += waitingInterval;
			}, waitingInterval);
		}
	}

	RserveInterface.prototype.connectToRServeAsync = function(callback) {
		serverIsRunningAsync(function(isRunning){
			if (!isRunning) {
				console.log("Starting Rserve");
				startServerAsync(function(){openChannel(callback)});
			}
			else if (isRunning && (localConnection == undefined || localConnection.closed == true)){
				console.log("RServe running, but no channel open");
				openChannel(callback);
			}
			else
				console.log("RServe is already running and channel is open");
		});
	}

// 
	RserveInterface.prototype.stopServerAsync = function(callback){
		execCommandAsync('killall Rserve', callback);
		localConnection = undefined;
	}

	/*
	 * Runs the RServ Server and then checks every 100ms if it is running. When the
	 * Process is detected, it waits another ~400ms to call the callback (Service can
	 * be non responsive otherwise)
	 */
	function startServerAsync(callback){
		console.log("Starting RServe");
		// Launch the Service
		//execCommandAsync('cd "./lib/rserve-js/tests/" && R --slave --no-restore --vanilla --file="r_files/regular_start.R"');
		execCommandAsync('cd "' + _pathToRServJS + '/tests/" && R --slave --no-restore --vanilla --file="r_files/regular_start.R"');
		// Adjust these variables to adjust how long the process waits to find RServ
		var maximumWaitingTime = 1000;
		var attemptInterval = 100;
		
		var currentWaitingtime = 0;
		var interval = setInterval(function(){
			// Check if the Server is Running
			serverIsRunningAsync(function(isRunning){
				if (isRunning){
					// Stop the waiting process and run the callback
					clearInterval(interval);
					setTimeout(callback, 400); // Wait another 500 MS, otherwise the service connection can fail!
				}
			});
			// Stop searching for the process!
			if(currentWaitingtime > maximumWaitingTime){
				clearInterval(interval)
				console.log("RServe could not be started!");
			}
			// Increment current waiting time
			currentWaitingtime += attemptInterval;
		}, attemptInterval);
	}

	RserveInterface.prototype.isConnected = function() {
		return isConnected();
	}

	function isConnected(){
		if (localConnection == undefined)
			return false;
		else
			return localConnection.running;
	}

	/*
	 * Evaluate an R Term and get the Result via a callback
	 */
	RserveInterface.prototype.evaluateTermAsync = function(term, callback) {
		if (isConnected()){
			localConnection.eval(term, function(result){
				console.log("Term " + term + " evaluated");
				// Launch Callback
				if (callback != undefined)
					callback(result);
			});
		}
	}

// Closing Statements ------------------------
	return RserveInterface;
})();

module.exports = RserveInterface;