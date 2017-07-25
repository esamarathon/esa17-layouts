'use strict';
$(function() {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	// JQuery selectors.
	var extraDataBoxWrapper = $('#extraDataBoxWrapper');
	var hostsWrapper = $('#hostsWrapper');
	
	// Declaring other variables.
	var init = false;
	var next3Runs = [];
	var next3RunsTempCopy = [];
	var comingUpGameIndex = 0;
	
	var runDataArrayReplicant = nodecg.Replicant('runDataArray', speedcontrolBundle);
	var runDataActiveRunReplicant = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
	runDataActiveRunReplicant.on('change', function(newValue, oldValue) {
		if (!init) {
			init = true;
			refreshComingUpRunsData();
			showComingUpGame();
		}
	});
	
	nodecg.listenFor('forceRefreshIntermission', speedcontrolBundle, function() {
		refreshComingUpRunsData();
	});
	
	function refreshComingUpRunsData() {
		// Checks if the run data array is actually imported yet by checking if it's an array.
		if ($.isArray(runDataArrayReplicant.value)) {
			var indexOfCurrentRun = findIndexInRunDataArray(runDataActiveRunReplicant.value, runDataArrayReplicant.value);
			next3Runs = [];
			for (var i = 1; i <= 3; i++) {
				if (!runDataArrayReplicant.value[indexOfCurrentRun+i]) break;
				next3Runs.push(runDataArrayReplicant.value[indexOfCurrentRun+i]);
			}
		}
	}
	
	function showComingUpGame() {
		// Temp copy made so it doesn't break when you force refresh intermission.
		if (comingUpGameIndex === 0) next3RunsTempCopy = next3Runs.slice(0);
		
		var runData = next3RunsTempCopy[comingUpGameIndex];
		
		if (!runData) showMusicTicker(); // Move straight to music ticker if no games to show.
		else {
			var title = $('<div id="comingUpHeaderTextBox" class="flexContainer">Coming Up</div>');
			var container = $('<div class="comingUpRunsBox flexContainer"></div>');
			container.html(runData.game+' ('+runData.category+') by '+formPlayerNamesString(runData));
			var combinedElement = title.add(container);
			showExtraDataMessage(combinedElement);
			comingUpGameIndex++;
			
			// If there's no more games to show, move to the music ticker.
			if (comingUpGameIndex >= next3RunsTempCopy.length) {
				comingUpGameIndex = 0;
				setTimeout(showMusicTicker, 10000);
			}
			
			else setTimeout(showComingUpGame, 10000);
		}
	}
	
	// Gets the current song name.
	var songName = 'No Track Playing/No Data Available';
	var songDataReplicant = nodecg.Replicant('songData', {defaultValue: 'No Track Playing/No Data Available'});
	songDataReplicant.on('change', function(newValue) {
		songName = newValue;
	});
	
	// Stores if a song is playing (not paused).
	var songPlayingReplicant = nodecg.Replicant('songPlaying', {defaultValue: false, persistent: false});
	
	// Song name is the data of the song playing when displayed, does not change while on screen.
	function showMusicTicker() {
		// If no song is playing, don't show this data.
		if (!songPlayingReplicant.value) {showComingUpGame(); return;}
		
		var container = $('<div id="musicTicker" class="storageBox flexContainer"></div>');
		$('<img class="mcat">').appendTo(container);
		$('<div class="musicTickerText">'+songName+'</div>').appendTo(container);
		showExtraDataMessage(container);
		setTimeout(showComingUpGame, 10000);
	}
	
	function showExtraDataMessage(newHTML) {
		animationSetField(extraDataBoxWrapper, newHTML);
	}
	
	var hostData = nodecg.Replicant('hostData', {defaultValue: []});
	var hostDisplayStatus = nodecg.Replicant('hostDisplayStatus', {defaultValue: false});
	hostData.on('change', function() {
		if (hostDisplayStatus.value) {
			hideHosts(function() {
				showHosts();
			});
		}
	});
	
	hostDisplayStatus.value = false; // make sure this is set correctly on page load
	
	var hostStatusChanging = false;
	var tempShowTimeout;
	
	nodecg.listenFor('showHosts', function() {
		if (!hostStatusChanging) showHosts();
	});
	
	nodecg.listenFor('showHostsTemp', function() {
		if (!hostStatusChanging) {
			showHosts();
			tempShowTimeout = setTimeout(hideHosts, 30000);
		}
	});	
	
	nodecg.listenFor('hideHosts', function() {
		if (!hostStatusChanging) hideHosts();
	});
	
	function showHosts() {
		hostStatusChanging = true;
		hostsWrapper.html('');
		hostData.value.forEach(function(user, index) {
			createHostContainer(user, index).appendTo(hostsWrapper);
		});
		hostsWrapper.animate({'opacity': '1'}, 500, 'linear', function() {
			hostStatusChanging = false;
		});
		hostDisplayStatus.value = true;
	}
	
	function hideHosts(callback) {
		hostStatusChanging = true;
		clearTimeout(tempShowTimeout);
		hostDisplayStatus.value = false;
		hostsWrapper.animate({'opacity': '0'}, 500, 'linear', function() {
			hostStatusChanging = false;
			if (callback) callback();
		});
	}
	
	// Creates the HTML box element to be inserted on the page.
	function createHostContainer(hostData, index) {
		var container = $('<div class="playerContainer storageBox flexContainer"></div>');
		if (index === 0) container.attr('id', 'playerContainer1');
		$('<div class="playerText">'+hostData.name+'</div>').appendTo(container);
		
		// If the host data has a region set, will show their flag too.
		if (hostData.region) {
			var region = (hostData.region.indexOf('/') >= 0 && hostData.region.indexOf('GB') < 0) ? hostData.region.toLowerCase().substr(0,hostData.region.indexOf('/')) : hostData.region.toLowerCase();
			var flagURL = 'https://www.speedrun.com/images/flags/'+region+'.png';
		}
		
		if (flagURL) {
			var flag = $('<img class="playerFlag" onerror="imgError(this)">');
			flag.attr('src', flagURL);
			flag.appendTo(container);
		}
		
		return container;
	}
});