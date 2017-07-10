'use strict';

// This file will contain proper animations at some point;
// right now it is just here so I can use the functions later without tons of rewriting.

function animationSetField(selector, newHTML) {
	selector.html(newHTML);
}

function animationHideFlag(selector, region) {
	selector.hide();
}

function animationSetFlag(selector, region) {
	var flagURL = 'https://www.speedrun.com/images/flags/'+region.toLowerCase()+'.png';
	selector.attr('src',flagURL);
	selector.show();
}

function animationChangePlayerIconToName(selector) {
	selector.removeClass('twitchLogo').addClass('nameLogo');
}

function animationChangePlayerIconToTwitch(selector) {
	selector.removeClass('nameLogo').addClass('twitchLogo');
}