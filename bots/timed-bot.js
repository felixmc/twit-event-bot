'use strict';

module.exports = {
	init: function(client, dispatcher) {
		dispatcher.on('foo', function(data) {
			console.log('foo called! [timed]');

			setTimeout(function() {
				client.post('statuses/update', { status: 'bot testing: ' + data.message + ' [timed bot]' }, function(err, data, res) {
					if (err) console.error(err);
					console.log('data: ' + data);
					console.log('res: ' + res);
				});
			
			}, 10000);

		});
	}
};
