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
		changeDonationTotalStuff();
		showMessages();
	}
	
	// Donation total stuff.
	var currentDonationTotal;
	var lastCheckDonationTotal;
	var ticksSinceLastChange = -1;
	var showingSTCText = false;
	var showSTCText = 10000; // Show "Save the Children" text for 10 seconds.
	var showDonationTotal = 30000; // Show donation total for 30 seconds.
	var donationTotalReplicant = nodecg.Replicant('srcomDonationTotal', speedcontrolBundle);
	donationTotalReplicant.on('change', function(newValue) {
		if (newValue) {
			// Donations up to $45k are being matched, so modify the total to show that here.
			if (newValue < 45000) lastCheckDonationTotal = newValue*2;
			else if (newValue >= 45000) lastCheckDonationTotal = newValue+45000;
		}
	});
	function changeDonationTotalStuff() {
		ticksSinceLastChange++;
		
		// If we're not showing the "Save the Children" text and donation total has changed.
		if (!showingSTCText && lastCheckDonationTotal && lastCheckDonationTotal !== currentDonationTotal) {
			// If the page has just been loaded, just print the current value.
			if (!currentDonationTotal) donationTotalElement.html('$' + lastCheckDonationTotal.toFixed(2));
			else animationUpdateDonationTotal(donationTotalElement, currentDonationTotal, lastCheckDonationTotal);
			currentDonationTotal = lastCheckDonationTotal;
		}
		
		// If we're not showing the "Save the Children" text and it's time to change to it.
		else if (!showingSTCText && ticksSinceLastChange >= showDonationTotal/tickRate) {
			animationFadeOutInElements(donationTotalElement, stcTextElement);
			showingSTCText = true; ticksSinceLastChange = 0;
		}
		
		// If we are showing the "Save the Children" text and it's time to change to donation total.
		else if (showingSTCText && ticksSinceLastChange >= showSTCText/tickRate) {
			animationFadeOutInElements(stcTextElement, donationTotalElement);
			showingSTCText = false; ticksSinceLastChange = 0;
		}
	}
	
	var lastBigDonationObj;
	var lastBigDonation;
	var showLastBigDonation = false;
	var lastBigDonationTimeout;
	var newDonations = []; // Any new donations are stored for check on the ticks.
	nodecg.listenFor('srcomNewDonation', speedcontrolBundle, function(donationObj) {
		newDonations.push(donationObj);
		
		// Stores the last big donation that we got.
		if (donationObj.amount >= 2000) { // $20+
			lastBigDonationObj = donationObj;
			showLastBigDonation = false;
			clearTimeout(lastBigDonationTimeout);
			lastBigDonationTimeout = setTimeout(function() {showLastBigDonation = true;}, 300000); // 5 minutes
		}
	});
	
	var showingMessage = false;
	var messageIndex = 0;
	function showMessages() {
		var nothingDoneThisTime = false;
		
		// If we're showing a message right now, skip this tick.
		if (!showingMessage) {
			// We have donations to show, do that on this tick
			if (newDonations.length > 0) {
				showDonation(true, newDonations[0]); // Show first donation.
				newDonations.shift(); // Remove first donation.
			}
			
			else {
				if (messageIndex === 0) {
					showDonationGoal({});
				}
				
				if (messageIndex === 1) {
					showComingUpNext();
				}
				
				if (messageIndex === 2) {
					showOtherStreamMessage();
				}
				
				if (messageIndex === 3) {
					// Shows the last big top donation every 5 minutes.
					if (showLastBigDonation && lastBigDonationObj) {
						showLastBigDonation = false;
						clearTimeout(lastBigDonationTimeout);
						lastBigDonationTimeout = setTimeout(function() {showLastBigDonation = true;}, 300000); // 5 minutes
						showDonation(false, lastBigDonationObj);
					}
					
					else {nothingDoneThisTime = true;}
				}
				
				messageIndex++;
				if (messageIndex > 3) messageIndex = 0;
				
				if (nothingDoneThisTime) showMessages();
			}
		}
	}
	
	// Calls back when ready to be cleaned up on next tick.
	function showDonation(isNew, donationObj) {
		showingMessage = true;
		
		// Fade out whatever was in the message wrapper before.
		$('#messageWrapper').animate({'opacity': '0'}, 500, 'linear', function() {
			// Clear up message wrapper from last use if needed.
			$('#messageWrapper').removeClass();
			
			var html = '<div class="donationInnerWrapper">';
			html += formatDonationTitle(isNew, donationObj);
			
			// We don't want to show a donation comment if there isn't one.
			if (donationObj.comment && donationObj !== '') {
				var donationMessage = formatDonationMessage(donationObj);
				html += donationMessage;
			}
			
			html += '</div>';
			
			$('#messageWrapper').addClass('donationWrapper');
			
			var amountToScroll = 0;
			var timeToScrollFor = 10000; // 10 seconds default for donations that don't need to scroll.
			
			$('#messageWrapper').html(html);
			$('#messageWrapper').animate({'opacity': '1'}, 500, 'linear');
			
			if (donationMessage) {			
				// Find actual length of donation total element.
				$('.donationWrapper .donationMessage').css('overflow-x', 'scroll');
				var donationMessageWidth = $('.donationWrapper .donationMessage')[0].scrollWidth;
				$('.donationWrapper .donationMessage').css('overflow-x', 'hidden');
				
				var donationWrapperWidth = $('.donationWrapper').width();
				
				if (donationWrapperWidth < donationMessageWidth) {
					amountToScroll = donationMessageWidth-donationWrapperWidth;
					timeToScrollFor = amountToScroll*10;
				}
			}
			
			if (amountToScroll > 0) {
				$('.donationWrapper .donationMessage').delay(2500).animate({'margin-left': '-'+amountToScroll+'px'}, timeToScrollFor, 'linear', function() {
					showingMessage = false;
				});
			}
			
			else {
				setTimeout(function() {showingMessage = false;}, 2500+timeToScrollFor);
			}
		});
	}
	
	// Calls back when ready to be cleaned up on next tick.
	function showOtherStreamMessage() {
		showingMessage = true;
		
		// Fade out whatever was in the message wrapper before.
		$('#messageWrapper').animate({'opacity': '0'}, 500, 'linear', function() {
			// Clear up message wrapper from last use if needed.
			$('#messageWrapper').removeClass();
			
			$('#messageWrapper').html('Did you know we have 2 streams? Go check out the other one!');
			$('#messageWrapper').animate({'opacity': '1'}, 500, 'linear');
			
			setTimeout(function() {showingMessage = false;}, 10000);
		});
	}
	
	// Calls back when ready to be cleaned up on next tick.
	function showDonationGoal(goalObj) {
		showingMessage = true;
		
		// Fade out whatever was in the message wrapper before.
		$('#messageWrapper').animate({'opacity': '0'}, 500, 'linear', function() {
			// Clear up message wrapper from last use if needed.
			$('#messageWrapper').removeClass();
			
			$('#messageWrapper').html('This is where we should show the goals and bidwars coming up.');
			$('#messageWrapper').animate({'opacity': '1'}, 500, 'linear');
			
			setTimeout(function() {showingMessage = false;}, 10000);
		});
	}
	
	// Calls back when ready to be cleaned up on next tick.
	function showComingUpNext() {
		showingMessage = true;
		
		// Fade out whatever was in the message wrapper before.
		$('#messageWrapper').animate({'opacity': '0'}, 500, 'linear', function() {
			// Clear up message wrapper from last use if needed.
			$('#messageWrapper').removeClass();
			
			$('#messageWrapper').html('This is where we should show the next game coming up.');
			$('#messageWrapper').animate({'opacity': '1'}, 500, 'linear');
			
			setTimeout(function() {showingMessage = false;}, 10000);
		});
	}
	
	function formatDonationTitle(isNew, donationObj) {
		var donationAmount = '$'+(donationObj.amount/100).toFixed(2);
		var donationUser = (donationObj.user) ? donationObj.user.data.names.international : 'Anonymous';
		var html = '<div>';
		if (isNew) html += '<span class="donationTitle">New Donation:</span> ';
		html += donationUser+' ('+donationAmount+')';
		
		// Checks if the user who donated has a region set.
		if (donationObj.user && donationObj.user.data.location) {
			if (donationObj.user.data.location.region)
				var region = donationObj.user.data.location.region.code;
			else
				var region = donationObj.user.data.location.country.code;
		}
		
		// If a region was found, add their flag to the donation message.
		if (region) {
			var flagURL = 'https://www.speedrun.com/images/flags/'+region.toLowerCase()+'.png';
			html += ' <img class="flag" src="'+flagURL+'">';
		}
		
		html += '</div>';
		return html;
	}
	
	function formatDonationMessage(donationObj) {
		// Replacing multiple spaces/new lines.
		var message = donationObj.comment.replace(/\n/g, ' ').replace( /\s\s+/g, ' ');
		var html = '<div class="donationMessage">'+message+'</div>';
		return html;
	}
});