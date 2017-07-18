'use strict';
$(function() {
	var jsmediatags = window.jsmediatags;
	var isOBS = (window.obsstudio) ? true : false;
	var defaultVolume = 0.1;
	var songs = [];
	var init = false;
	var skippingSong = false;
	var pausingSong = false;
	var lastSongPlayed = '';
	
	// Stores song data to be displayed on layouts.
	var songDataReplicant = nodecg.Replicant('songData', {defaultValue: 'No Track Playing/No Data Available', persistent: false});
	
	// Stores if a song is playing (not paused).
	var songPlayingReplicant = nodecg.Replicant('songPlaying', {defaultValue: false, persistent: false});
	
	// Checks if music is playing anywhere else so nothing gets confused.
	var musicPlayerActiveReplicant = nodecg.Replicant('musicPlayerActive', {defaultValue: false, persistent: false});
	musicPlayerActiveReplicant.on('change', function(newValue) {
		if (!init && !newValue) {
			getCurrentSongList(function(newSongList) {
				songs = newSongList;
				
				// Update song list every minute. (This is a bad way of checking for new songs!)
				setInterval(function() {getCurrentSongList(function(newSongList) {songs = newSongList;});}, 60000);
				
				musicPlayerActiveReplicant.value = true;
				var audioPlayer = $('#audioPlayer');
				var mp3Source = $('#mp3_src')[0];
				audioPlayer[0].volume = defaultVolume;
				playNextSong();
				
				audioPlayer[0].onended = function() {
					if (!skippingSong) playNextSong();
				}
				
				// For detecting when OBS can see the player.
				if (isOBS) {
					window.obsstudio.onActiveChange = function(active) {
						if (!skippingSong) {
							if (active) unpauseMusic();
							else pauseMusic();
						}
					};
				}
				
				// For detecting when the player can be seen based on hashes on the end of the URL (for vMix).
				// #visible - if the player is on a visible scene
				// #hidden - if the player is no longer visible on a scene
				// #toggle - will do whatever the opposite is of what it's currently doing
				else {
					var sceneLive = false;
					$(window).on('hashchange', function() {
						if (location.hash === '#used')
							return;
						
						if (location.hash === '#toggle') {
							if (sceneLive)
								location.hash = '#hidden';
							else
								location.hash = '#visible';
							
							$(window).trigger('hashchange');
						}
						
						else {
							if (location.hash !== '#visible') {
								sceneLive = false;
								if (!skippingSong) pauseMusic();
							}
							
							else {
								sceneLive = true;
								if (!skippingSong) unpauseMusic();
							}
						}
						
						location.hash = '#used';
					});
				}
				
				// Triggered from a dashboard button.
				nodecg.listenFor('skipSong', function() {
					skippingSong = true;
					pauseMusic(function() { // Fade out and pause track.
						playNextSong(); // Move to the next track.
						audioPlayer[0].volume = defaultVolume; // Set volume back to default.
						skippingSong = false;
					});
				});
				
				// Triggered from a dashboard button.
				nodecg.listenFor('pausePlaySong', function() {
					if (songPlayingReplicant.value) pauseMusic();
					else unpauseMusic();
				});
				
				function playNextSong() {
					// Remove last song played so it doesn't accidentally repeat.
					var lastSongIndex = songs.indexOf(lastSongPlayed);
					var songsPurged = songs.slice(0);
					if (lastSongIndex >= 0 && songs.length > 1)
						songsPurged.splice(lastSongIndex, 1);
					
					// Pick a new song to play and play it.
					var randomSong = songsPurged[Math.floor(Math.random()*songsPurged.length)];
					lastSongPlayed = randomSong;
					songPlayingReplicant.value = true;
					mp3Source.src = 'mp3/'+randomSong;
					audioPlayer[0].load();
					audioPlayer[0].play();
					getMusicTagData(mp3Source.src, function(err, title, artist) {
						if (!err) songDataReplicant.value = title+' - '+artist;
						else songDataReplicant.value = 'No Track Playing/No Data Available';
					});
				}
				
				function unpauseMusic() {
					pausingSong = true;
					songPlayingReplicant.value = true;
					audioPlayer[0].play();
					audioPlayer.stop(); // stop any "animation" if it's going on
					audioPlayer.animate({'volume': defaultVolume}, 5000, 'linear', function() {
						pausingSong = false;
					});
				}
				
				function pauseMusic(callback) {
					pausingSong = true;
					songPlayingReplicant.value = false;
					audioPlayer.stop(); // stop any "animation" if it's going on
					audioPlayer.animate({'volume': 0}, 5000, 'linear', function() {
						audioPlayer[0].pause();
						pausingSong = false;
						if (callback) callback();
					});
				}
				
				// This works with both close and refresh (well, it should do).
				$(window).on('beforeunload', function() {
					songDataReplicant.value = 'No Track Playing/No Data Available';
					musicPlayerActiveReplicant.value = false;
				});
				
				// callback: error (true/false), title, artist
				function getMusicTagData(fileURL, callback) {
					jsmediatags.read(fileURL, {
						onSuccess: function(tag) {
							// Checking if the title is available, if not will callback an error.
							if (tag && tag.tags && tag.tags.title) callback(false, tag.tags.title, tag.tags.artist);
							else callback(true);
						},
						onError: function(error) {
							callback(true);
						}
					});
				}
			});
		}
			
		init = true;
	});
	
	function getCurrentSongList(callback) {
		nodecg.sendMessage('getSongList', 'notNeededString', function(songList) {
			callback(songList);
		});
	}
});