module.exports = function() {
  var rooms = [];

  return {
    getRoom: function(index) {
      return rooms[index];
    },
    getRooms: function() {
      return rooms;
    },
    getRoomId: function(room) {
      return rooms.indexOf(room);
    },
    addRoom: function(room) {
      rooms.push(room);
    }
  }
}
