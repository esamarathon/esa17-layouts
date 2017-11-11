'use strict';
$(function() {
	// JQuery selectors.
	var hostsForm = $('#hostsForm');
	
	var hostAmount = 0;
	var alertTimeout;
	
	var hostData = nodecg.Replicant('hostData', {defaultValue: []});
	var hostDisplayStatus = nodecg.Replicant('hostDisplayStatus', {defaultValue: false});
	
	// Get host data when it changes/on load of page.
	hostData.on('change', function(newValue) {
		$('#hostList').html('');
		hostAmount = 0;
		
		newValue.forEach(function(user) {
			var hostElement = $('<div class="hostInputContainer"><input type="text" name="hostName" placeholder="Username" value="'+user.name+'" class="hostInput"><img class="flag"><input type="button" class="removeUser" value="Remove"></div>');
			
			if (user.region) {
				var flagURL = 'https://www.speedrun.com/images/flags/'+user.region.toLowerCase()+'.png';
				hostElement.find('.flag').attr('src', flagURL); // set flag image
				hostElement.find('.flag').css('display', 'inline'); // unhide flags
			}
			$('#hostList').append(hostElement);
			
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
		$('#hostList').append('<div class="hostInputContainer"><input type="text" name="hostName" placeholder="Username" class="hostInput"><img class="flag"><input type="button" class="removeUser" value="Remove"></div>');
		
		hostAmount++;
	});
	
	// Submit changes made to hosts.
	$('#hostsForm').submit(function(event) {
		event.preventDefault();
		var inputs = $('#hostsForm').serializeArray();
		
		var newHostData = [];
		$('#bottomAlert').html('Saving, please wait...');
		clearTimeout(alertTimeout);
		
		$('input').attr('disabled','disabled');
		$('input').css('opacity',0.5);
		$('.flag').css('opacity',0.5);
		
		async.eachSeries(inputs, function(user, callback) {
			// Allow people to specify regions manually in the format USER#REGION
			var regexMatch = user.value.match(/(.*)#([0-9a-zA-Z]+)/);
			
			// Ignore boxes that are blank.
			if (user.value === '') callback();
			
			else if (regexMatch) {
				var name = regexMatch[1];
				var region = regexMatch[2]; // region really needs checking but is hard to
				
				var hostDataObj = {name: name, region:region};
				newHostData.push(hostDataObj);
				callback();
			}
			
			else {
				var hostDataObj = {name: user.value};
				getUserDataFromSpeedrunCom(user.value, function(username, regionCode) {
					if (username) hostDataObj.name = username;
					if (regionCode) hostDataObj.region = regionCode;
					newHostData.push(hostDataObj);
					
					callback();
				});
			}
		}, function(err) {
			$('input').removeAttr('disabled');
			$('input').css('opacity',1);
			$('.flag').css('opacity',1);
			configureHostTriggerVisibility(hostDisplayStatus.value);
			$('#bottomAlert').html('Changes saved!');
			alertTimeout = setTimeout(function() {$('#bottomAlert').html('');}, 5000);
			
			hostData.value = newHostData;
		});
	});
	
	// Enable/disable show and hide buttons when not needed.
	hostDisplayStatus.on('change', function(newValue) {
		$('#showHideButtons input').attr('disabled','disabled');
		$('#showHideButtons input').css('opacity',0.5);
		setTimeout(function() {
			$('#showHideButtons input').removeAttr('disabled');
			$('#showHideButtons input').css('opacity',1);
			configureHostTriggerVisibility(newValue);
		}, 1000);
	});
	
	function configureHostTriggerVisibility(value) {
		if (value) {
			$('#showHosts').attr('disabled','disabled');
			$('#showHosts').css('opacity',0.5);
			$('#showHostsTemp').attr('disabled','disabled');
			$('#showHostsTemp').css('opacity',0.5);
			$('#hideHosts').css('opacity',1);
			$('#hideHosts').removeAttr('disabled');
		}
		
		else {
			$('#hideHosts').attr('disabled','disabled');
			$('#hideHosts').css('opacity',0.5);
			$('#showHosts').css('opacity',1);
			$('#showHostsTemp').css('opacity',1);
			$('#showHosts').removeAttr('disabled');
			$('#showHostsTemp').removeAttr('disabled');
		}
	}
	
	$('#showHosts').click(function(event) {
		nodecg.sendMessage('showHosts');
	});
	
	$('#showHostsTemp').click(function(event) {
		nodecg.sendMessage('showHostsTemp');
	});
	
	$('#hideHosts').click(function(event) {
		nodecg.sendMessage('hideHosts');
	});
	
	// Submit custom message.
	$('#customMsgForm').submit(function(event) {
		event.preventDefault();
		var inputs = $('#customMsgForm').serializeArray();

		$('#customMsgAlert').html('Sending...');
		nodecg.sendMessage('newInfoBarCustomMessage', inputs[0].value);
		$('#customMsgAlert').html('Sent!');
		
		$('#customMsgForm input').attr('disabled','disabled');
		$('#customMsgForm input').css('opacity',0.5);
		
		setTimeout(function() {$('#customMsgAlert').html('');}, 5000);
		
		setTimeout(function() {
			$('#customMsgForm input').removeAttr('disabled');
			$('#customMsgForm input').css('opacity',1);
		}, 60000);
	});
	
	// Tries to find the specified user on speedrun.com and get their country/region.
	// Only using username lookups for now, need to use both in case 1 doesn't work.
	function getUserDataFromSpeedrunCom(username, callback) {
		var foundName;
		var foundRegion;
		
		async.waterfall([
			function(callback) {
				if (username) {
					var url = 'https://www.speedrun.com/api/v1/users?max=1&lookup='+username.toLowerCase();
					querySRComForUserData(url, function(name, regionCode) {
						if (name) foundName = name;
						if (regionCode) foundRegion = regionCode;
						callback();
					});
				}
				
				else callback();
			}
		], function(err, result) {
			callback(foundName, foundRegion);
		});
	}
	
	// Helper function for the function above.
	function querySRComForUserData(url, callback) {
		var foundName;
		var foundRegion;
		
		$.ajax({
			url: url,
			dataType: "jsonp",
			success: function(data) {
				if (data.data.length > 0) {
					foundName = data.data[0].names.international;
					
					if (data.data[0].location) {
						foundRegion = data.data[0].location.country.code;
					}
				}
				
				callback(foundName, foundRegion);
			}
		});
	}
});