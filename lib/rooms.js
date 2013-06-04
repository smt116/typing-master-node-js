/*jshint node: true */
'use strict';

var room = require('../models/room').Room;

module.exports = function() {
  var ifCallback = function(callback, object) {
    if(typeof callback !== 'undefined') {
      callback(object);
    }
  };

  return {
    getRoom: function(id, callback) {
      room.findById(id, function(err, object) {
        ifCallback(callback, object);
      });
    },
    getAccesibleRooms: function(callback) {
      room.find({time: { $gte: new Date().getTime() + 10 }}, function(err, object) {
        ifCallback(callback, object);
      });
    },
    getRooms: function(callback) {
      room.find(function(err, object) {
        ifCallback(callback, object);
      });
    },
    addRoom: function(options, callback) {
      new room(options).save(function(err, object) {
        ifCallback(callback, object);
      });
    }
  };
};
