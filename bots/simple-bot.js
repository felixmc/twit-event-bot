'use strict';

module.exports = {
	init: function(client, dispatcher) {
		dispatcher.on('foo', function(data) {
			console.log('foo called! [simple]');
			client.post('statuses/update', { status: 'bot testing: ' + data.message + ' [simple bot]'}, function(err, data, res) {
				if (err) console.error(err);
				console.log('data: ' + data);
				console.log('res: ' + res);
			});
		});
	}
};
