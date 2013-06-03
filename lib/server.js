var socketio = require('socket.io'),
    model = require('../models/text'),
    rooms = require('./rooms')(rooms);

var playerRoom = {}
var playersInRoom = []

var startCountingTime = function(socket, roomTime) {
  var timeCounter = setInterval(function() {
    var currentTime = new Date().getTime(),
        diff = (roomTime - currentTime) / 1000;

    if(diff > 0) {
      socket.emit('time', diff);
    } else {
      clearInterval(timeCounter);
      socket.emit('timeUnlock');
    }
  }, 50);
}

exports.listen = function(server) {
  var io = socketio.listen(server);
  io.set('log level', 1);

  //cheat for heroku
  if(process.env.NODE_ENV === 'production') {
    io.configure(function() {
      io.set("transports", ["xhr-polling"]);
      io.set("polling duration", 10);
    });
  }

  io.sockets.on('connection', function(socket) {
    var createNew = true;

    var createNewRoom = function(timeToStart, category) {
      var callback = function(room) {
        var roomIndex = rooms.getRoomId(room);

        socket.emit('text', room, roomIndex);

        playerRoom[socket] = roomIndex;
        playersInRoom[roomIndex] = [socket.id];
        socket.join(rooms.getRoom(roomIndex));

        startCountingTime(socket, room.time);
      }

      var findRandom = function(callback) {
        model.Text.findRandomText(function(object) {
          var room = {
            time: new Date().getTime() + (timeToStart * 1000),
            text: object.text,
            category: object.category
          };
          rooms.addRoom(room);
          callback(room);
        });
      }

      if(typeof category === 'undefined') {
        findRandom(callback);
      } else {
        model.Text.findOne({category: category}, function(err, object) {
          if(object === null) {
            findRandom(callback);
          } else {
            var room = {
              time: new Date().getTime() + (timeToStart * 1000),
              text: object.text,
            };
            rooms.addRoom(room);
            callback(room);
          }
        });
      }
    };

    var joinRoom = function(roomId) {
      socket.join(rooms.getRoom(roomId));
      socket.emit('text', rooms.getRoom(roomId), roomId);

      playerRoom[socket] = roomId;
      playersInRoom[roomId].push(socket.id);

      socket.broadcast.to(rooms.getRoom(playerRoom[socket])).emit('playerStatsInit', {
        player: socket.id,
      });

      socket.emit('playersInRoom', {
        players: playersInRoom[roomId],
        current: socket.id
      });

      startCountingTime(socket, rooms.getRoom(roomId).time);
    };

    var cleanUserRoom = function() {
      //FIXME is this really necessary? handle in other way
      for(var index in rooms.getRooms()) {
        if(playersInRoom[index].indexOf(socket.id)) {
          socket.leave(rooms.getRoom(index));
          delete playersInRoom[index][playersInRoom[index].indexOf(socket.id)];
        }
        if(playersInRoom[index].length === 0) {
          delete playersInRoom[index];
        }
      }
    }

    var joinRandomRoom = function() {
      for(var index in rooms.getRooms()) {
        var timeDiff = rooms.getRoom(index).time - new Date().getTime();
        if(timeDiff > 10000 && timeDiff < 30000) {
          createNew = false;
          joinRoom(index);
          break;
        }
      }

      if(createNew) {
        createNewRoom(30);
      }
    }

    socket.on('disconnect', function() {
      for(var index in rooms.getRooms()) {
        if(playersInRoom[index].indexOf(socket.id)) {
          socket.leave(rooms.getRoom(index));
          delete playersInRoom[index][playersInRoom[index].indexOf(socket.id)];
        }
      }
    });

    socket.on('createRoom', function(userTimeToStart, category) {
      createNewRoom(userTimeToStart, category);
    });

    socket.on('joinRoom', function(roomId) {
      var room = rooms.getRoom(roomId);

      cleanUserRoom();
      if(room && room.time - new Date().getTime() > 10000) {
        joinRoom(roomId);
      } else {
        joinRandomRoom();
      }
    });

    socket.on('join', function() {
      cleanUserRoom();
      joinRandomRoom();
    });

    socket.on('playerStats', function(data) {
      socket.broadcast.to(rooms.getRoom(playerRoom[socket])).emit('playerStatsData', {
        player: socket.id,
        stats: data
      });
    });
  });
}
