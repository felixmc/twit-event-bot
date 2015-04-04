'use strict';

var _  = require('lodash');
var fs = require('fs');

exports.load = function(filepath) {
	var data = require(filepath);

	var users = {
		get: function(username) {
			return _.findWhere(data, { username: username });	
		},
		contains: function(username) {
			return users.get(username);
		},
		remove: function(username) {
			data = _.filter(data, function(u) {
				return u.username != username;
			});
		},
		add: function(user) {
			if (users.contains(user.username)) {
				users.remove(user.username);
			}	
			
			data.push(user);
		},
		save: function() {
			fs.writeFile(filepath, JSON.stringify(data, null, '\t'), function (err) {
				if (err) return console.log(err);
			});
		}
	};

	return users;
};
