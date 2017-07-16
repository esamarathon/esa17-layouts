'use strict';
$(function() {
	// JQuery selectors.
	var clockArea = $('#clockArea');
	
	// Simple clock with flashing colon.
	var hasColon = false;
	setClock();
	setInterval(setClock, 1000);
	function setClock() {
		if (hasColon) $('#clockArea').html(moment().format('HH mm'));
		else $('#clockArea').html(moment().format('HH:mm'));
		hasColon = !hasColon;
	}
});