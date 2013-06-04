var room = require('../models/room').Room;

module.exports = function() {
  return {
    getRoom: function(id, callback) {
      room.findById(id, function(err, object) {
        if(typeof callback !== 'undefined') {
          callback(object);
        }
      });
    },
    getFutureRooms: function(callback) {
      room.find({time: { $gte: new Date().getTime() + 10 }}, function(err, object) {
        if(typeof callback !== 'undefined') {
          callback(object);
        }
      });
    },
    getRooms: function(callback) {
      room.find(function(err, object) {
        if(typeof callback !== 'undefined') {
          callback(object);
        }
      });
    },
    addRoom: function(options, callback) {
      new room(options).save(function(err, object) {
        if(typeof callback !== 'undefined') {
          callback(object);
        }
      });
    }
  }
}
