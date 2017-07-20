'use strict';
$(function() {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	var firstStream = true;
	if (typeof nodecg.bundleConfig !== 'undefined' && nodecg.bundleConfig.secondStream)
		firstStream = false;
	
	// JQuery selectors.
	var webcamArea = $('#webcam1');
	var twitchEmbed = $('#twitchEmbed');
	var comingUpRunsBox = $('#comingUpRunsBox');
	var musicTickerText = $('.musicTickerText');
	var webcamHeaderText = $('#webcamHeaderText');
	
	// Declaring other variables.
	var init = false;
	var whenTotal = 0; // Totals all the estimates for calculating the "in about X" lines.
	
	// Twitch's own JavaScript implementation of their player sucks and I don't wanna rely on it,
	// so need to do some of my own API calls to know when to add/remove this.
	//twitchEmbed.html('<iframe src="https://player.twitch.tv/?muted&channel=geekygoonsquad" frameborder="0" scrolling="no" height="'+webcamArea.height()+'" width="'+webcamArea.width()+'"></iframe>');
	//setTimeout(function() {twitchEmbed.html('');}, 10000);
	
	// This will change depending on if the stream is being displayed or not, and what stream the layouts are being
	// displayed on.
	var webcamHeader = 'Check out our other stream! twitch.tv/';
	if (firstStream)
		webcamHeader += 'geekygoonsquad';
	else 
		webcamHeader += 'esamarathon';
	webcamHeaderText.html(webcamHeader);
	
	var songDataReplicant = nodecg.Replicant('songData', {defaultValue: 'No Track Playing/No Data Available'});
	songDataReplicant.on('change', function(newValue) {
		// Hide the song name and make it so we can find out the whole width of the string.
		musicTickerText.animate({'opacity': '0'}, 500, 'linear', function() {
			musicTickerText.html(newValue);
			musicTickerText.css('flex', 'initial');
			musicTickerText.css('overflow', 'visible');
		
			// Store the width.
			var songLength = musicTickerText.width();
			
			// Reverse the changes from above.
			musicTickerText.css('flex', 'auto');
			musicTickerText.css('overflow', 'hidden');
			musicTickerText.animate({'opacity': '1'}, 500, 'linear');
			
			// See if this needs a marquee effect to show the whole song name.
			var speed = songLength*12;
			if (musicTickerText.width() <= songLength) {
				musicTickerText.marquee({
					'duration': speed,
					'startVisible': true,
					'duplicated': true,
					'gap': 200
				});
			}
		});
	});
	
	var runDataArrayReplicant = nodecg.Replicant('runDataArray', speedcontrolBundle);
	var runDataActiveRunReplicant = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
	runDataActiveRunReplicant.on('change', function(newValue, oldValue) {
		if (!init) {
			init = true;
			refreshComingUpRunsData();
		}
	});
	
	nodecg.listenFor('forceRefreshIntermission', speedcontrolBundle, function() {
		refreshComingUpRunsData();
	});
	
	function refreshComingUpRunsData() {
		// Checks if the run data array is actually imported yet by checking if it's an array.
		if ($.isArray(runDataArrayReplicant.value)) {
			var indexOfCurrentRun = findIndexInRunDataArray(runDataActiveRunReplicant.value, runDataArrayReplicant.value);
			var next4Runs = [];
			for (var i = 1; i <= 4; i++) {
				if (!runDataArrayReplicant.value[indexOfCurrentRun+i]) break;
				next4Runs.push(runDataArrayReplicant.value[indexOfCurrentRun+i]);
			}
			
			updateComingUpRuns(next4Runs);
		}
	}
	
	// Set information on the layout for upcoming runs.
	function updateComingUpRuns(next4Runs) {
		// Reset important stuff.
		whenTotal = 0;
		
		// Fade out.
		comingUpRunsBox.animate({'opacity': '0'}, 500, 'linear', function() {
			comingUpRunsBox.html(''); // Clears out old boxes, if needed.
			
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
});