'use strict';

var express = require('express')
  , logger  = require('morgan')
  , extend  = require('node.extend');

var TwitDispatcher = require('./lib/twit-event-dispatcher');
var RestDispatcher = require('./lib/rest-twit-event-server');
var Twit           = require('twit');

var config   = require('./config');
var accounts = require('./lib/account-manager').load(__dirname + '/accounts.json');

var app = express();
app.use(logger('common'));

// setup bot registration
var twtAuth = require('./lib/twit-bot-auth');

twtAuth(app, {
	consumerKey:    config.app.consumer_key,
	consumerSecret: config.app.consumer_secret,
	hostname:       config.server.hostname,
	port:           config.server.port,
	autoLogout:     true,
	title:          'TwitBot Registry',
	routes: {	
		home:     '/register/',
		auth:     '/auth/twitter',
		callback: '/auth/twitter/callback',
		login:    '/register/login',
		logout:   '/register/logout',
		failure:  '/register/failure',
		profile:  '/register/profile'
	}
}, function(token, secret, profile) {
	accounts.add({
		token:    token,
		secret:   secret,
		username: profile.username
	});

	accounts.save();
});



var dispatcher     = new TwitDispatcher();
var restDispatcher = new RestDispatcher(dispatcher);


for (var user in config.bots) {
	var account = accounts.get(user);
	if (account) {
		var client = new Twit(extend(true, config.app,
		{ access_token: account.token, access_token_secret: account.secret }));

		for (var botIndex = 0; botIndex < config.bots[user].length; botIndex++) {
			var botName = config.bots[user][botIndex];
			var bot = require(config.paths.bots + '/' + botName).init(client, dispatcher);
		}
	} else {
		console.error('Bot init failed: could not find tokens for bot: ' + user);
	}
}


app.use('/api/', restDispatcher.router);

app.listen(config.server.port, function() {
	console.log('Twit Bot Service running on port ' + config.server.port);
});

