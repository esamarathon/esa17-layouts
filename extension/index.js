'use strict';

var app = require('express')();

module.exports = function(nodecg) {
	var fs = require('fs');
	require('./twitchapi')(nodecg);
	
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
	
	var hostControlRouter = require('express').Router();
	app.use('/hostcontrol', hostControlRouter);
	
	hostControlRouter.get("/showhosts", function(req, res) {
		nodecg.sendMessage('showHosts');		
		res.status(200);
		res.end();
	});
	
	hostControlRouter.get("/showhoststemp", function(req, res) {
		nodecg.sendMessage('showHostsTemp');		
		res.status(200);
		res.end();
	});
	
	hostControlRouter.get("/hidehosts", function(req, res) {
		nodecg.sendMessage('hideHosts');		
		res.status(200);
		res.end();
	});
	
    nodecg.mount(app);
};