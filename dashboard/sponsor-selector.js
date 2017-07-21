'use strict';
$(function() {
	var currentPremiumSponsorImage = nodecg.Replicant('currentPremiumSponsorImage')
	currentPremiumSponsorImage.on('change', function(newValue) {
		var current = 'None';
		if (newValue) current = newValue;
		$('#currentLogoName').html('<b>Current Logo:</b> '+current);
	});
	
	var sponsorImagesPremium = nodecg.Replicant('assets:premiumsponsors');
	sponsorImagesPremium.on('change', function(newValue) {
		if (newValue) {
			$('#logoSelector').html('');
			newValue.forEach(function(logo) {
					$('#logoSelector')
						.append($("<input></input>")
							.attr("name",'sponsor')
							.attr("type",'radio')
							.attr("value",logo.base)
							.text(logo.base))
							.append(' '+logo.base+'<br>');
			});
			
			$('#logoSelector').append('<br><input type="submit" id="submitButton">');
			$('#submitButton').button();
		}
	});
	
	$('#logoSelector').submit(function(event) {
		event.preventDefault();
		var option = $('#logoSelector').serializeArray()[0].value;
		currentPremiumSponsorImage.value = option;
	});
});