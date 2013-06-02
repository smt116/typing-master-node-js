var socketio = require('socket.io'),
    model = require('../models/text');

var rooms = []
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

    var createNewRoom = function(timeToStart) {
      model.Text.findRandomText(function(object) {
        var room = {
          time: new Date().getTime() + (timeToStart * 1000),
          text: object.text,
        };
        rooms.push(room);
        var roomIndex = rooms.indexOf(room);

        socket.emit('text', room, roomIndex);

        playerRoom[socket] = roomIndex;
        playersInRoom[roomIndex] = [socket.id];
        socket.join(rooms[roomIndex]);

        startCountingTime(socket, room.time);
      });
    };

    var joinRoom = function(roomId) {
      socket.join(rooms[roomId]);
      socket.emit('text', rooms[roomId], roomId);

      playerRoom[socket] = roomId;
      playersInRoom[roomId].push(socket.id);

      socket.broadcast.to(rooms[playerRoom[socket]]).emit('playerStatsInit', {
        player: socket.id,
      });

      socket.emit('playersInRoom', {
        players: playersInRoom[roomId],
        current: socket.id
      });

      startCountingTime(socket, rooms[roomId].time);
    };

    var cleanUserRoom = function() {
      //FIXME is this really necessary? handle in other way
      for(var index in rooms) {
        if(playersInRoom[index].indexOf(socket.id)) {
          socket.leave(rooms[index]);
          delete playersInRoom[index][playersInRoom[index].indexOf(socket.id)];
        }
        if(playersInRoom[index].length === 0) {
          delete playersInRoom[index];
        }
      }
    }

    var joinRandomRoom = function() {
      for(var index in rooms) {
        var timeDiff = rooms[index].time - new Date().getTime();
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
      for(var index in rooms) {
        if(playersInRoom[index].indexOf(socket.id)) {
          socket.leave(rooms[index]);
          delete playersInRoom[index][playersInRoom[index].indexOf(socket.id)];
        }
      }
    });

    socket.on('createRoom', function(userTimeToStart) {
      createNewRoom(userTimeToStart);
    });

    socket.on('joinRoom', function(roomId) {
      var room = rooms[roomId];

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
      socket.broadcast.to(rooms[playerRoom[socket]]).emit('playerStatsData', {
        player: socket.id,
        stats: data
      });
    });
  });
}
