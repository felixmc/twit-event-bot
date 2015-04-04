'use strict';

var util         = require('util');
var EventEmitter = require('events').EventEmitter;

function TwitDispatcher() {

}

util.inherits(TwitDispatcher, EventEmitter);

module.exports = TwitDispatcher;
