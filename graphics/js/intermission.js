'use strict';
$(function() {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	// JQuery selectors.
	var webcam1Area = $('#webcam1');
	var twitchEmbed = $('#twitchEmbed');
	var comingUpRunsBox = $('#comingUpRunsBox');
	var musicTickerText = $('.musicTickerText');
	var webcamHeaderText = $('#webcamHeaderText');
	
	// Declaring other variables.
	var init = false;
	var whenTotal = 0; // Totals all the estimates for calculating the "in about X" lines.
	
	// Twitch's own JavaScript implementation of their player sucks and I don't wanna rely on it,
	// so need to do some of my own API calls to know when to add/remove this.
	//twitchEmbed.html('<iframe src="https://player.twitch.tv/?muted&channel=geekygoonsquad" frameborder="0" scrolling="no" height="'+webcam1Area.css('height')+'" width="'+webcam1Area.css('width')+'"></iframe>');
	//setTimeout(function() {twitchEmbed.html('');}, 10000);
	
	// This will change depending on if the stream is being displayed or not.
	var webcamHeader = 'Check out our 2nd stream! twitch.tv/geekygoonsquad';
	webcamHeaderText.html(webcamHeader);
	
	// Will add the actual song name once the player is designed.
	var songName = 'This is the text of some music title! This is the text of some music title!';
	musicTickerText.html(songName);
	
	// Hide the song name and make it so we can find out the whole width of the string.
	musicTickerText.css('opacity', '0');
	musicTickerText.css('flex', 'initial');
	musicTickerText.css('overflow', 'visible');
	
	// Store the width.
	var songLength = musicTickerText.css('width');
	
	// Reverse the changes from above.
	musicTickerText.css('flex', 'auto');
	musicTickerText.css('overflow', 'hidden');
	musicTickerText.css('opacity', '1');
	
	// See if this needs a marquee effect to show the whole song name.
	if (musicTickerText.css('width') <= songLength) {
		musicTickerText.marquee({
			'duration': 10000
		});
	}
	
	var runDataArrayReplicant = nodecg.Replicant('runDataArray', speedcontrolBundle);
	var runDataActiveRunReplicant = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
	runDataActiveRunReplicant.on('change', function(newValue, oldValue) {
		if (!init) {
			init = true;
			
			// Checks if the run data array is actually imported yet by checking if it's an array.
			if ($.isArray(runDataArrayReplicant.value)) {
				var indexOfCurrentRun = findIndexInRunDataArray(newValue, runDataArrayReplicant.value);
				var next4Runs = [];
				for (var i = 1; i <= 4; i++) {
					if (!runDataArrayReplicant.value[indexOfCurrentRun+i]) break;
					next4Runs.push(runDataArrayReplicant.value[indexOfCurrentRun+i]);
				}
				
				updateComingUpRuns(next4Runs);
			}
		}
	});
	
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
	
	// Set information on the layout for upcoming runs.
	function updateComingUpRuns(next4Runs) {
		// Reset important stuff.
		whenTotal = 0;
		
		// Fade out.
		comingUpRunsBox.animate({'opacity': '0'}, 500, 'linear', function() {
			// Create containers for all the runs.
			for (var i = 0; i < next4Runs.length; i++) {
				var container = createComingUpRunContainer(next4Runs[i], next4Runs[i-1]);
				container.appendTo(comingUpRunsBox);
			}
			
			// Fade in.
			comingUpRunsBox.animate({'opacity': '1'}, 500, 'linear');
		});
	}
	
	// Creates the HTML box element to be inserted on the page.
	function createComingUpRunContainer(runData, previousRunData) {
		var container = $('<div class="comingUpRunContainer storageBox flexContainer"></div>');
		
		// An extra div is needed to make sure all of these are on individual lines.
		var divWrapper = $('<div></div>');
		
		if (!previousRunData) var whenString = 'Next';
		else {
			var fullTime = whenTotal + previousRunData.estimateS + previousRunData.setupTimeS;
			whenTotal = whenTotal+fullTime;
			var formatted = moment().second(0).to(moment().second(fullTime), true);
			var whenString = 'In about '+formatted;
		}
		
		$('<div id="gameWhen">'+whenString+'</div>').appendTo(divWrapper);
		$('<div id="gameTitle">'+runData.game+'</div>').appendTo(divWrapper);
		$('<div id="gameCategory">'+runData.category+'</div>').appendTo(divWrapper);
		
		// Players stuff below.
		var players = $('<div id="gamePlayers"></div>');
		$('<img class="playerLogo nameLogo">').appendTo(players);
		$('<span>&nbsp;'+formPlayerNamesString(runData)+'&nbsp;</span>').appendTo(players);
		
		// Dirty hack to show co-op icon if the first team is configured to show it.
		var showTeamIcon = runData.teams[0] && runData.teams[0].members.length > 1;
		if (showTeamIcon) $('<img class="playerCoOp">').appendTo(players);
		
		players.appendTo(divWrapper);
		divWrapper.appendTo(container);
		
		return container;
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
});