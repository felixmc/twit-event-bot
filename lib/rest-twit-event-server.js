'use strict';

var express        = require('express');
var TwitDispatcher = require('./twit-event-dispatcher');

function RestTwitDispatcher(dispatcher) {
	if (!dispatcher)
		dispatcher = new TwitDispatcher();

	var router = express.Router();
	router.post('/', function(req, res) {
		if (req.body.event && req.body.data) {
			dispatcher.emit(req.body.event, req.body.data);
			res.status(200).send('Ok');
		} else
			res.status(400).send('Bad Request');
	});

	var rest = {
		server: null,
		dispatcher: dispatcher,
		router: router,
		listen: function(port, callback) {
			if (!rest.server)
				rest.server = express();

			rest.server.use(require('body-parser').json());
			rest.server.use(rest.router);

			rest.server.listen(port, callback);
		}
	};

	return rest;
}

module.exports = RestTwitDispatcher;
