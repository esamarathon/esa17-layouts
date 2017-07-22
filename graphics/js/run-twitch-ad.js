'use strict';
$(function() {
	var isOBS = (window.obsstudio) ? true : false;
	
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