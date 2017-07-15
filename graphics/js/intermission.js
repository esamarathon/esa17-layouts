'use strict';
$(function() {
	var webcam1Area = $('#webcam1');
	var twitchEmbed = $('#twitchEmbed');
	
	// Twitch's own JavaScript implementation of their player sucks and I don't wanna rely on it,
	// so need to do some of my own API calls to know when to add/remove this.
	twitchEmbed.html('<iframe src="https://player.twitch.tv/?muted&channel=geekygoonsquad" frameborder="0" scrolling="no" height="'+webcam1Area.css('height')+'" width="'+webcam1Area.css('width')+'"></iframe>');
	setTimeout(function() {twitchEmbed.html('');}, 10000);
});