'use strict';
$(function() {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	// JQuery selectors.
	var playerContainers = $('.playerContainer'); // Array
	
	// Declaring other variables.
	//var displayTwitchFor = 15000;
	var displayTwitchFor = 14000;
	//var displayNameFor = 45000;
	var displayNameFor = 7000;
	var teamOn1Display = $('.gameCapture').length === 1; // 1 team >2 displays if there is >1 game capture.
	
	var runDataActiveRunReplicant = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
	runDataActiveRunReplicant.on('change', function(newValue, oldValue) {
		if (newValue) updateSceneFields(newValue);
	});
	
	function updateSceneFields(runData) {
		console.log(JSON.stringify(runData));
		
		// clean up stuff from last time
		
		// 1 team only.
		if (runData.teams.length === 1) {
			// 1 player only.
			if (runData.teams[0].members.length === 1) {
				configurePlayerContainer(0, runData.teams[0].members[0]);
			}
			
			// >1 player.
			else if (runData.teams[0].members.length > 1) {
				// Will display all names in one box.
				if (teamOn1Display) {
					
				}
			}
		}
		
		// More than 1 team (usually singular people in races).
		else if (runData.teams.length > 1) {
			// All teams have 1 player in them; normal race.
			if (runData.teams.length === runData.players.length) {
				
			}
			
			// >1 team with >1 players in each. Not supported yet.
			else console.log('Multiple players in multiple teams; not implemented (yet?).');
		}
	}
	
	function configurePlayerContainer(index, data) {
		console.log(JSON.stringify(data));
		
		// Sets a flag if available.
		if (data.region) animationSetFlag($('.playerFlag', playerContainers[index]), data.region);
		
		changeToName(index, data);
	}
	
	function changeToTwitch(index, data) {
		var formattedURL = data.twitch.uri.replace('https://www.', '');
		animationChangePlayerIconToTwitch($('.playerLogo', playerContainers[index]));
		animationSetField($('.playerText', playerContainers[index]), formattedURL);
		setTimeout(function() {changeToName(index, data);}, displayTwitchFor);
	}
	
	function changeToName(index, data) {
		animationChangePlayerIconToName($('.playerLogo', playerContainers[index]));
		animationSetField($('.playerText', playerContainers[index]), data.names.international);
		setTimeout(function() {changeToTwitch(index, data);}, displayNameFor);
	}
});