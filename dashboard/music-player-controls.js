'use strict';
$(function() {
	// If the music player is active anwhere or not.
	var musicPlayerActiveReplicant = nodecg.Replicant('musicPlayerActive', {defaultValue: false, persistent: false});
	
	// Toggles resetting player status if needed.
	$('#forceResetPlayer').button();
	$('#forceResetPlayer').click(function() {
		musicPlayerActiveReplicant.value = false;
		location.reload(); // Reload the panel, for safety.
	});
	
	// Causes the music player to skip the current song.
	$('#skipSong').button();
	$('#skipSong').click(function() {
		// Temp disable button.
		$('#skipSong').button({disabled: true, label:'Skipping...'});
		$('#pausePlaySong').button({disabled: true});
		nodecg.sendMessage('skipSong');
	});	
	
	// Causes the music player to pause/unpause the current song.
	$('#pausePlaySong').button();
	$('#pausePlaySong').click(function() {
		// Temp disable button.
		$('#pausePlaySong').button({disabled: true});
		nodecg.sendMessage('pausePlaySong');
	});
	
	// Changes text and button status to indicate what is going on.
	musicPlayerActiveReplicant.on('change', function(newValue) {
		if (newValue) {
			var message = 'A music player is currently active somewhere; if it\'s not and it broke, then press the button above to reset the status.'
			$('#skipSong').button({disabled: false, label:'Skip Song'});
			$('#forceResetPlayer').button({disabled: false});
			$('#playerButtons').show();
		}
		
		else {
			var message = 'A music player is currently not active anywhere.';
			$('#skipSong').button({disabled: true, label:'Cannot skip, no player'});
			$('#forceResetPlayer').button({disabled: true});
			$('#playerButtons').hide();
		}
		
		$('#isMusicPlaying').html(message);
	});
	
	// Changes text and button status to indicate what is going on.
	var songPlayingReplicant = nodecg.Replicant('songPlaying', {defaultValue: false, persistent: false});
	songPlayingReplicant.on('change', function(newValue) {
		if (newValue) {
			$('#pausePlaySong').button({disabled: false, label:'Pause Song'});
			$('#skipSong').button({disabled: false, label:'Skip Song'});
		}
		
		else {
			$('#pausePlaySong').button({disabled: false, label:'Play Song'});
			$('#skipSong').button({disabled: true, label:'Cannot skip, paused'});
		}
	});
});