'use strict';
$(function() {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	// JQuery selectors.
	var stcTextElement = $('#stcText');
	var donationTotalElement = $('#donationTotal');
	
	// Declaring other variables.
	var tickRate = 5000; // Everything changes/updates every 5 seconds.
	
	// This is where everything changes or checks for changes so they all happen at the same time.
	// First timeout is a dirty hack to wait for the replicants to be ready.
	setTimeout(tick, 100); setInterval(tick, tickRate);
	function tick() {
		console.log('tick emitted');
		changeDonationTotalStuff();
	}
	
	// Donation total stuff.
	var currentDonationTotal;
	var ticksSinceLastChange = -1;
	var showingSTCText = false;
	var showSTCText = 10000; // Show "Save the Children" text for 10 seconds.
	var showDonationTotal = 30000; // Show donation total for 30 seconds.
	var donationTotalReplicant = nodecg.Replicant('srcomDonationTotal', speedcontrolBundle);
	function changeDonationTotalStuff() {
		ticksSinceLastChange++;
		var newDonationTotal = donationTotalReplicant.value;
		
		// If we're not showing the "Save the Children" text and donation total has changed.
		if (!showingSTCText && newDonationTotal && newDonationTotal !== currentDonationTotal) {
			// If the page has just been loaded, just print the current value.
			if (!currentDonationTotal) donationTotalElement.html('$' + newDonationTotal.toFixed(2));
			else animationUpdateDonationTotal(donationTotalElement, currentDonationTotal, newDonationTotal);
			currentDonationTotal = newDonationTotal;
		}
		
		// If we're not showing the "Save the Children" text and it's time to change to it.
		else if (!showingSTCText && ticksSinceLastChange >= showDonationTotal/tickRate) {
			animationFadeBetweenElements(donationTotalElement, stcTextElement);
			showingSTCText = true; ticksSinceLastChange = 0;
		}
		
		// If we are showing the "Save the Children" text and it's time to change to donation total.
		else if (showingSTCText && ticksSinceLastChange >= showSTCText/tickRate) {
			animationFadeBetweenElements(stcTextElement, donationTotalElement);
			showingSTCText = false; ticksSinceLastChange = 0;
		}
	}
});