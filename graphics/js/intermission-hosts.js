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
	var comingUpGameIndex = 0;
	
	var runDataArrayReplicant = nodecg.Replicant('runDataArray', speedcontrolBundle);
	var runDataActiveRunReplicant = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
	runDataActiveRunReplicant.on('change', function(newValue, oldValue) {
		if (!init) {
			init = true;
			
			// Checks if the run data array is actually imported yet by checking if it's an array.
			if ($.isArray(runDataArrayReplicant.value)) {
				var indexOfCurrentRun = findIndexInRunDataArray(newValue, runDataArrayReplicant.value);
				next3Runs = [];
				for (var i = 1; i <= 3; i++) {
					if (!runDataArrayReplicant.value[indexOfCurrentRun+i]) break;
					next3Runs.push(runDataArrayReplicant.value[indexOfCurrentRun+i]);
				}
			}
			
			showComingUpGame();
		}
	});
	
	function showComingUpGame() {
		var runData = next3Runs[comingUpGameIndex];
		
		if (!runData) showMusicTicker(); // Move straight to music ticker if no games to show.
		else {
			var title = $('<div id="comingUpHeaderTextBox" class="flexContainer">Coming Up</div>');
			var container = $('<div class="comingUpRunsBox flexContainer"></div>');
			container.html(runData.game+' ('+runData.category+') by '+formPlayerNamesString(runData));
			var combinedElement = title.add(container);
			showExtraDataMessage(combinedElement);
			comingUpGameIndex++;
			
			// If there's no more games to show, move to the music ticker.
			if (comingUpGameIndex >= next3Runs.length) {
				comingUpGameIndex = 0;
				setTimeout(showMusicTicker, 10000);
			}
			
			else setTimeout(showComingUpGame, 10000);
		}
	}
	
	// Will add the actual song name once the player is designed.
	var songName = 'Yours Truly (feat. Danyka Nadeau) (Aaron Jackson Remix) - Mr FijiWiji';
	
	function showMusicTicker() {
		var container = $('<div id="musicTicker" class="storageBox flexContainer"></div>');
		$('<img class="mcat">').appendTo(container);
		$('<div class="musicTickerText">'+songName+'</div>').appendTo(container);
		showExtraDataMessage(container);
		setTimeout(showComingUpGame, 30000);
	}
	
	function showExtraDataMessage(newHTML) {
		animationSetField(extraDataBoxWrapper, newHTML);
	}
	
	// Temp code until the actual hosts stuff is implemented with their own dashboard.
	// Their data and the triggers for showing this will then be triggered by them.
	addFakeHosts();
	function addFakeHosts() {
		hostsWrapper.animate({'opacity': '0'}, 500, 'linear', function() {
			hostsWrapper.html('');
			for (var i = 0; i < 4; i++) {
				var hostData = {
					name: 'ASampleName',
					region: 'SE'
				}
				
				createHostContainer(hostData, i).appendTo(hostsWrapper);
			}
			
			hostsWrapper.animate({'opacity': '1'}, 500, 'linear');
			
			setTimeout(function() {
				hostsWrapper.animate({'opacity': '0'}, 500, 'linear');
				setTimeout(addFakeHosts, 10000);
			}, 10000);
		});
	}
	
	// Creates the HTML box element to be inserted on the page.
	function createHostContainer(hostData, index) {
		var container = $('<div class="playerContainer storageBox flexContainer"></div>');
		if (index === 0) container.attr('id', 'playerContainer1');
		$('<div class="playerText">'+hostData.name+'</div>').appendTo(container);
		
		// If the host data has a region set, will show their flag too.
		if (hostData.region)
			var flagURL = 'https://www.speedrun.com/images/flags/'+hostData.region.toLowerCase()+'.png';
		
		if (flagURL) {
			var flag = $('<img class="playerFlag">');
			flag.attr('src', flagURL);
			flag.appendTo(container);
		}
		
		return container;
	}
});