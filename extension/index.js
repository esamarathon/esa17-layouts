'use strict';
module.exports = function(nodecg) {
	var fs = require('fs');
	
	// Used to get list of songs from the MP3 directory for the music player.
	nodecg.listenFor('getSongList', function(nonNeededVar, callback) {
		var mp3Dir = __dirname+'/../graphics/mp3/';
		
		var songs = [];
		fs.readdir(mp3Dir, function(err, files) {
			if (!err) {
				files.forEach(function(song) {
					if (song.endsWith('.mp3')) songs.push(song);
				});
			}
			
			callback(songs);
		});
	});
};