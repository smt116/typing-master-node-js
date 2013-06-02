var socketio = require('socket.io'),
    model = require('../models/text');

var rooms = []
var playerRoom = {}
var playersInRoom = []

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
    var createNew = true,
        roomTime;

    socket.on('disconnect', function() {
      for(var index in rooms) {
        if(playersInRoom[index].indexOf(socket.id)) {
          socket.leave(rooms[index]);
          delete playersInRoom[index][playersInRoom[index].indexOf(socket.id)];
        }
      }
    });

    //FIXME is this really necessary?
    for(var index in rooms) {
      if(playersInRoom[index].indexOf(socket.id)) {
        socket.leave(rooms[index]);
        delete playersInRoom[index][playersInRoom[index].indexOf(socket.id)];
      }
      if(playersInRoom[index].length === 0) {
        delete playersInRoom[index];
      }
    }

    for(var index in rooms) {
      var time = new Date().getTime();
      if(rooms[index].time - time > 10000) {
        createNew = false;
        roomTime = rooms[index].time;

        socket.join(rooms[index]);
        socket.emit('text', rooms[index]);

        playerRoom[socket] = rooms[index];
        playersInRoom[index].push(socket.id);

        socket.broadcast.to(rooms[playerRoom[socket]]).emit('playerStatsInit', {
          player: socket.id,
        });

        socket.emit('playersInRoom', {
          players: playersInRoom[index],
          current: socket.id
        });

        break;
      }
    }

    if(createNew) {
      model.Text.findRandomText(function(object) {
        var room = {
          time: new Date().getTime() + 20000,
          text: object.text
        };

        roomTime = room.time;
        rooms.push(room);

        socket.emit('text', room);

        playerRoom[socket] = rooms.indexOf(room);
        playersInRoom[rooms.indexOf(room)] = [socket.id];
      });
    }

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

    socket.on('playerStats', function(data) {
      socket.broadcast.to(rooms[playerRoom[socket]]).emit('playerStatsData', {
        player: socket.id,
        stats: data
      });
    });
  });
}
