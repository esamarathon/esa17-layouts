'use strict';
$(function() {
	// JQuery selectors.
	var sponsorImageAreaNormal = $('#sponsorImageAreaNormal');
	
	if ($('#sponsorImageAreaTopPremium').length > 0)
		var sponsorImageAreaPremium = $('#sponsorImageAreaTopPremium');
	else if ($('#sponsorImageAreaPremium').length > 0)
		var sponsorImageAreaPremium = $('#sponsorImageAreaPremium');
	
	if (!sponsorImageAreaPremium)
		var sponsorImageAreaPremium = sponsorImageAreaNormal;
	
	var sponsorRotationInit = false;
	var sponsorImagesNormal = nodecg.Replicant('assets:normalsponsors');
	var currentNormalSponsorImage;
	sponsorImagesNormal.on('change', function(newValue) {
		if (!sponsorRotationInit && newValue.length > 0) {
			setInterval(rotateNormal, 60000);
			rotateNormal();
			sponsorRotationInit = true;
		}
	});
	
	var sponsorImagesPremium = nodecg.Replicant('assets:premiumsponsors');
	var currentPremiumSponsorImage = nodecg.Replicant('currentPremiumSponsorImage')
	currentPremiumSponsorImage.on('change', function(newValue) {
		if (newValue === 'none') {
			changeSponsorImage(sponsorImageAreaPremium);
		}
		
		else if (newValue) {
			var url = '/assets/esa17-layouts/premiumsponsors/'+newValue;
			changeSponsorImage(sponsorImageAreaPremium, url);
		}
	});
	
	var normalIndex = 0;
	function rotateNormal() {
		changeSponsorImage(sponsorImageAreaNormal, sponsorImagesNormal.value[normalIndex].url);
		normalIndex++;
		if (normalIndex >= sponsorImagesNormal.value.length) normalIndex = 0;
	}
	
	function changeSponsorImage(element, assetURL) {
		$('.sponsorLogoCurrent', element).animate({'opacity': '0'}, 500, 'linear');
		
		element.append('<div class="sponsorLogo sponsorLogoNext"></div>');
		
		$('.sponsorLogoNext', element).css('background-image', (assetURL)?'url("'+assetURL+'")':'none');
		
		$('.sponsorLogoNext', element).animate({'opacity': '1'}, 500, 'linear', function() {
			$('.sponsorLogoCurrent', element).remove();
			$('.sponsorLogoNext', element).removeClass('sponsorLogoNext').addClass('sponsorLogoCurrent');
		});
	}
	
	
});