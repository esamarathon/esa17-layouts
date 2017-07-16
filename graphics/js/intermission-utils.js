'use strict';

function findIndexInRunDataArray(run, runDataArray) {
	var indexOfRun = -1;
	
	// Completely skips this if the run variable isn't defined.
	if (run) {
		for (var i = 0; i < runDataArray.length; i++) {
			if (run.runID === runDataArray[i].runID) {
				indexOfRun = i;
				break;
			}
		}
	}
	
	return indexOfRun;
}

// Mostly copied from the player-info.js file, but CBA to make another file to store it in.
function formPlayerNamesString(runData) {
	// Goes through each team and members and makes a string to show the names correctly together.
	var namesArray = [];
	var namesList = 'No Runner(s)';
	runData.teams.forEach(function(team) {
		var teamMemberArray = [];
		team.members.forEach(function(member) {teamMemberArray.push(member.names.international);});
		namesArray.push(teamMemberArray.join(', '));
	});
	namesList = namesArray.join(' vs. ');
	
	return namesList;
}

// Copied from HoraroImportDashboard.js in the speedcontrol bundle.
function msToTime(duration) {
	var minutes = parseInt((duration / 60) % 60);
	var hours = parseInt(duration / (3600));
	
	hours = (hours < 10) ? '0' + hours : hours;
	minutes = (minutes < 10) ? '0' + minutes : minutes;
	
	return hours + ':' + minutes;
}