'use strict';

// Simple fade out/in animation by using opacity.
function animationSetField(selector, newHTML) {
	$(selector).animate({'opacity': '0'}, 500, 'linear', function() {
		if (newHTML) selector.html(newHTML);
		$(selector).animate({'opacity': '1'}, 500, 'linear');
	});
}

function animationFadeBetweenElements(selector1, selector2) {
	$(selector1).animate({'opacity': '0'}, 500, 'linear');
	$(selector2).animate({'opacity': '1'}, 500, 'linear');
}

// Animation lasts under 1 tick (5s) so no extra callbacks are needed.
function animationUpdateDonationTotal(selector, oldValue, newValue) {
	$(selector)
	.prop('number', oldValue*100)
	.animateNumber({
		number: newValue*100,
		numberStep: function(now, tween) {
			var flooredNumber = Math.floor(now)/100;
			var target = $(tween.elem);
			flooredNumber = flooredNumber.toFixed(2);
			target.html('$'+flooredNumber);
		}
	}, 4000, 'linear');
}

// Used to clean player containers that are not needed.
// (This doesn't actually clear them, just hides the elements for now).
function animationCleanPlayerData(selector) {
	var elementsToFadeOut = '.playerLogo, .playerText, .playerFlag, .playerCoOp';
	$(selector).find(elementsToFadeOut).animate({'opacity': '0'}, 500, 'linear');
}

function animationChangePlayerData(selector, playerData, twitch, hideCoop, showCoop) {
	// Get a URL for flag image if region is set, if old and new URL are the same, nothing is done.
	if (playerData.region)
		var flagURL = 'https://www.speedrun.com/images/flags/'+playerData.region.toLowerCase()+'.png';
	var leaveFlag = $('.playerFlag', selector).attr('src') === flagURL;
	
	// Configuring elements that need fading out this time.
	var elementsToFadeOut = '.playerLogo, .playerText';
	if (!leaveFlag) elementsToFadeOut = elementsToFadeOut+', .playerFlag';
	if (hideCoop) elementsToFadeOut = elementsToFadeOut+', .playerCoOp';
	
	// Do the actual fading out by going to opacity 0.
	$(selector).find(elementsToFadeOut).animate({'opacity': '0'}, 500, 'linear');
	
	// Triggers once everything from the above animate is done.
	$(selector).find(elementsToFadeOut).promise().done(function() {
		// Hide these elements if we want to completely remove them.
		if (!leaveFlag) $('.playerFlag', selector).hide();
		if (hideCoop) $('.playerCoOp', selector).hide();
		
		if (twitch) {
			var name = (playerData.twitch) ? 'twitch.tv/'+playerData.twitch : '???';
			$('.playerLogo', selector).removeClass('nameLogo').addClass('twitchLogo');
		}
		
		else {
			var name = playerData.name;
			$('.playerLogo', selector).removeClass('twitchLogo').addClass('nameLogo');
		}
		
		$('.playerText', selector).html(name);
		
		// If changing the flag and we have a URL to set, do that and show it.
		if (!leaveFlag && flagURL) {
			$('.playerFlag', selector).attr('src', flagURL);
			$('.playerFlag', selector).show();
		}
		
		// Configuring elements that need fading in this time.
		var elementsToFadeIn = '.playerLogo, .playerText';
		if (!leaveFlag) elementsToFadeIn = elementsToFadeIn+', .playerFlag';
		if (showCoop) {
			elementsToFadeIn = elementsToFadeIn+', .playerCoOp';
			$('.playerCoOp', selector).show();
		}
		
		// Do the actual fading in by going to opacity 1.
		$(selector).find(elementsToFadeIn).animate({'opacity': '1'}, 500, 'linear');
	});
}