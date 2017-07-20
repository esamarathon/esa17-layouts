'use strict';
var needle = require('needle');

/* Stuff copied from twitchapi.js file from nodecg-speedcontrol. */

module.exports = function(nodecg) {
	var firstStream = true;
	if (typeof nodecg.bundleConfig !== 'undefined' && nodecg.bundleConfig.secondStream)
		firstStream = false;
	
	var streamIndex = (firstStream) ? 1 : 0; // if first stream, get data about 2nd, and vice versa
	
	var otherStreamCurrentDataReplicant = nodecg.Replicant('otherStreamCurrentData', {persistent:false});
	
	// Default Twitch request options needed.
	var requestOptions = {
		headers: {
			'Accept': 'application/vnd.twitchtv.v5+json',
			'Client-ID': 'lrt9h6mot5gaf9lk62sea8u38lomfrc',
			'Content-Type': 'application/json'
		}
	};
	
	                   /* ESAMarathon   GeekyGoonSquad */
	var streamChannelIDs = ['54739364', '82775102'];
	
	getStreamInfo();
	// Used to frequently get the details of a stream for use for layouts.
	function getStreamInfo() {
		var url = 'https://api.twitch.tv/kraken/streams/'+streamChannelIDs[streamIndex];
		needle.get(url, requestOptions, function(err, response) {
			if (handleResponse(err, response)) {
				otherStreamCurrentDataReplicant.value = response.body;
			}
			
			setTimeout(getStreamInfo, 60000);
		});
	}
	
	// Prints error details to the console if needed.
	// true if no issues, false if there were any
	function handleResponse(err, response) {
		if (err || response.statusCode !== 200) {
			console.log('Error occurred in communication with twitch, look below');
			console.log(err);
			console.log(response.body);
			return false;
		}
		
		else return true;
	}
};