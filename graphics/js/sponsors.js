'use strict';
$(function() {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	// JQuery selectors.
	var sponsorImageAreaNormal = $('#sponsorImageAreaNormal');
	
	if ($('#sponsorImageAreaTopPremium').length > 0)
		var sponsorImageAreaPremium = $('#sponsorImageAreaTopPremium');
	else if ($('#sponsorImageAreaPremium').length > 0) {
		var sponsorImageAreaPremium = $('#sponsorImageAreaPremium');
	}
	
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
		if (newValue) {
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
		element.css('background-image', 'url("'+assetURL+'")');
	}
	
	
});