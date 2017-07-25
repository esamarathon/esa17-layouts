'use strict';
$(function() {
	var isOBS = (window.obsstudio) ? true : false;
	var timerElement = $('#timer');
	
	var timerInterval;
	nodecg.listenFor('twitchAdStarted', 'nodecg-speedcontrol', function() {
		showCountdown();
		timerInterval = setInterval(decreaseTimer, 1000);
	});
	
	var secondsLeft;
	function showCountdown() {
		secondsLeft = 180; // 3 minutes
		timerElement.html('Twitch Ads Running: '+msToTime(secondsLeft));
		timerElement.css('opacity', '1');
	}
	function decreaseTimer() {
		if (secondsLeft <= 0) {
			clearInterval(timerInterval);
			hideCountdown();
		}
		
		else {
			secondsLeft--;
			timerElement.html('Twitch Ads Running: '+msToTime(secondsLeft));
		}
	}
	function hideCountdown() {
		timerElement.css('opacity', '0');
	}
	
	function msToTime(duration) {
		var seconds = parseInt((duration)%60),
			minutes = parseInt((duration/(60))%60),
			
		minutes = (minutes < 10) ? minutes : minutes;
		seconds = (seconds < 10) ? '0' + seconds : seconds;

		return minutes + ':' + seconds;
	}
	
	// For detecting when OBS can see the player.
	if (isOBS) {
		window.obsstudio.onActiveChange = function(active) {
			if (active) nodecg.sendMessageToBundle('playTwitchAd', 'nodecg-speedcontrol');
		};
	}
	
	// For detecting when the player can be seen based on hashes on the end of the URL (for vMix).
	// #visible - if the player is on a visible scene
	// #hidden - if the player is no longer visible on a scene
	// #toggle - will do whatever the opposite is of what it's currently doing
	else {
		var sceneLive = false;
		$(window).on('hashchange', function() {
			if (location.hash === '#used')
				return;
			
			if (location.hash === '#toggle') {
				if (sceneLive)
					location.hash = '#hidden';
				else
					location.hash = '#visible';
				
				$(window).trigger('hashchange');
			}
			
			else {
				if (location.hash !== '#visible') {
					sceneLive = false;
					nodecg.sendMessageToBundle('playTwitchAd', 'nodecg-speedcontrol');
				}
				
				else {
					sceneLive = true;
				}
			}
			
			location.hash = '#used';
		});
	}
});