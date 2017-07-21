'use strict';
$(function() {
	// JQuery selectors.
	var hostsForm = $('#hostsForm');
	
	var hostAmount = 0;
	var alertTimeout;
	
	var hostData = nodecg.Replicant('hostData', {defaultValue: []});
	
	// Get host data when it changes/on load of page.
	hostData.on('change', function(newValue) {
		$('#hostList').html('');
		hostAmount = 0;
		
		newValue.forEach(function(user) {	
			$('#hostList').append('<div><input type="text" name="hostName" placeholder="Username" value="'+user.name+'"><input type="button" class="removeUser" value="-"></div>');
			hostAmount++;
		});
		
		if (hostAmount === 0) $('#hostList').html('No hosts set.');
	});
	
	// Remove a host.
	$(document).on('click', '.removeUser', function() {
		$(this).parent().remove();
		hostAmount--;
		if (hostAmount === 0) $('#hostList').html('No hosts set.');
	});
	
	// Add a new blank field for more hosts.
	$('#addNew').click(function(event) {
		if (hostAmount === 0) $('#hostList').html('');
		$('#hostList').append('<div><input type="text" name="hostName" placeholder="Username"><input type="button" class="removeUser" value="-"></div>');
		hostAmount++;
	});
	
	// Submit changes made to hosts.
	$('#hostsForm').submit(function(event) {
		event.preventDefault();
		var inputs = $('#hostsForm').serializeArray();
		
		var newHostData = [];
		inputs.forEach(function(user) {
			// Ignore boxes that are blank.
			if (user.value !== '') newHostData.push({name: user.value});
		});
		
		$('#bottomAlert').html('Changes saved!')
		clearTimeout(alertTimeout);
		alertTimeout = setTimeout(function() {$('#bottomAlert').html('');}, 5000);
		
		hostData.value = newHostData;
	});
});