'use strict';
$(function() {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	var firstStream = true;
	if (typeof nodecg.bundleConfig !== 'undefined' && nodecg.bundleConfig.secondStream)
		firstStream = false;
	var channelNameToEmbed = (firstStream) ? 'geekygoonsquad' : 'esamarathon';
	
	// JQuery selectors.
	var webcamArea = $('#webcam1');
	var twitchEmbed = $('#twitchEmbed');
	var comingUpRunsBox = $('#comingUpRunsBox');
	var musicTickerText = $('.musicTickerText');
	var webcamHeaderText = $('#webcamHeaderText');
	
	// Declaring other variables.
	var isOBS = (window.obsstudio) ? true : false;
	var init = false;
	var next4Runs = [];
	var refreshingNextGames = false;
	
	var streamLive = false;
	var otherStreamCurrentDataReplicant = nodecg.Replicant('otherStreamCurrentData', {persistent:false});
	otherStreamCurrentDataReplicant.on('change', function(newValue) {
		var newStreamLive;
		if (newValue.stream)
			newStreamLive = true;
		else
			newStreamLive = false;
		
		if (newStreamLive !== streamLive) {
			if (newStreamLive) {
				twitchEmbed.html('<iframe src="https://player.twitch.tv/?muted&channel='+channelNameToEmbed+'" frameborder="0" scrolling="no" height="'+webcamArea.height()+'" width="'+webcamArea.width()+'"></iframe>');
			}
			else 
				twitchEmbed.html('');
		}
		
		streamLive = newStreamLive;
	});
	
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
	
	if (isOBS) {
		window.obsstudio.onActiveChange = function(active) {
			if (active) {
				updateComingUpRuns();
			}
		};
	}
	
	var runDataArrayReplicant = nodecg.Replicant('runDataArray', speedcontrolBundle);
	var runDataActiveRunReplicant = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
	runDataActiveRunReplicant.on('change', function(newValue, oldValue) {
		if (!init) {
			init = true;
			refreshComingUpRunsData();
			updateComingUpRuns();
		}
	});
	
	nodecg.listenFor('forceRefreshIntermission', speedcontrolBundle, function() {
		refreshComingUpRunsData();
		if (!isOBS) updateComingUpRuns();
	});
	
	function refreshComingUpRunsData() {
		// Checks if the run data array is actually imported yet by checking if it's an array.
		if ($.isArray(runDataArrayReplicant.value) && !refreshingNextGames) {
			refreshingNextGames = true;
			var indexOfCurrentRun = findIndexInRunDataArray(runDataActiveRunReplicant.value, runDataArrayReplicant.value);
			next4Runs = [];
			for (var i = 1; i <= 4; i++) {
				if (!runDataArrayReplicant.value[indexOfCurrentRun+i]) break;
				next4Runs.push(runDataArrayReplicant.value[indexOfCurrentRun+i]);
			}
			refreshingNextGames = false;
		}
	}
	
	// Set information on the layout for upcoming runs.
	function updateComingUpRuns() {
		var whenTotal = [0]; // Totals all the estimates for calculating the "in about X" lines.
		 
		// Fade out.
		comingUpRunsBox.animate({'opacity': '0'}, 500, 'linear', function() {
			comingUpRunsBox.html(''); // Clears out old boxes, if needed.
			
			// Create containers for all the runs.
			for (var i = 0; i < next4Runs.length; i++) {
				var container = createComingUpRunContainer(next4Runs[i], next4Runs[i-1], whenTotal);
				container.appendTo(comingUpRunsBox);
			}
			
			// Fade in.
			comingUpRunsBox.animate({'opacity': '1'}, 500, 'linear');
		});
	}
	
	// Creates the HTML box element to be inserted on the page.
	function createComingUpRunContainer(runData, previousRunData, whenTotal) {
		var container = $('<div class="comingUpRunContainer storageBox flexContainer"></div>');
		
		// An extra div is needed to make sure all of these are on individual lines.
		var divWrapper = $('<div></div>');
		
		var whenString = '';
		if (!previousRunData) whenString = 'Next';
		else {
			var runTime = previousRunData.estimateS + previousRunData.setupTimeS;
			var formatted = moment.utc().second(0).to(moment.utc().second(whenTotal[0]+runTime), true);
			//whenString = 'In about '+msToTime(whenTotal[0]+runTime);
			whenString = 'In about '+formatted;
			whenTotal[0] += runTime;
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
	
	function msToTime(duration) {
		var minutes = parseInt((duration / 60) % 60);
		var hours = parseInt(duration / (3600));
		
		hours = (hours === 0) ? '' : (hours > 1)?hours+' hours ':hours+' hour ';
		minutes = (minutes === 0) ? '' : (minutes > 1)?minutes+' minutes ':minutes+' minute';
		
		return hours + minutes;
	}
});