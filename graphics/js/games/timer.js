'use strict';
$(function() {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	// JQuery selectors.
	var timerText = $('#timerContainer #timer');
	var finishTimeContainers = $('.finishTimeContainer'); // Array
	
	// Declaring other variables.
	var currentTime = '';
	
	var stopWatchReplicant = nodecg.Replicant('stopwatch', speedcontrolBundle);
	stopWatchReplicant.on('change', function(newValue, oldValue) {
		if (!newValue) return;
		var time = newValue.time || '88:88:88';
		
		// Change class on the timer to change the colour if needed.
		if (oldValue) timerText.toggleClass('timer_'+oldValue.state, false);
		timerText.toggleClass('timer_'+newValue.state, true);
		
		timerText.html(time);
		timerText.lettering(); // Makes each character into a <span>.
		currentTime = time;
	});
	
	// Used to hide finish times for everyone.
	nodecg.listenFor('resetTime', speedcontrolBundle, function() {
		finishTimeContainers.each(function(index, element) {
			$('#finishTime', element).html('');
			$(element).css('opacity', '0');
		});
	});
	
	// Used to hide finish timers just for the specified index.
	nodecg.listenFor('timerReset', speedcontrolBundle, function(index) {
		var container = finishTimeContainers.eq(index);
		$('#finishTime', container).html('');
		container.addClass('hideFinishTime');
		container.css('opacity', '0');
	});
	
	// Used to show finish timers for the specified index.
	nodecg.listenFor('timerSplit', speedcontrolBundle, function(index) {
		var container = finishTimeContainers.eq(index);
		$('#finishTime', container).html(currentTime);
		container.css('opacity', '100');
	});
	
});