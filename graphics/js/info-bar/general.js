'use strict';
$(function() {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	// JQuery selectors.
	var donationTotal = $('#donationTotal');
	
	// Declaring other variables.
	var donationInit = false;
	
	// When the donation total updates.
	var donationTotalReplicant = nodecg.Replicant('srcomDonationTotal', speedcontrolBundle);
	donationTotalReplicant.on('change', function(newValue, oldValue) {
		// If the page has just been loaded, just print the current value.
		if (!donationInit) {
			donationTotal.html('$' + newValue.toFixed(2));
			donationInit = true;
		}
		
		else {
			//animation_updateDonationTotal($('#donationTotal'), oldValue, newValue);
			// needs some new animation stuff
			donationTotal.html('$' + newValue.toFixed(2));
		}
	});
});