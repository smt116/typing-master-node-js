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
    var createNew = true;
    for(index in rooms) {
      var time = new Date().getTime();
      if(rooms[index].time - time > 15000) {
        socket.join(rooms[index]);
        createNew = false;
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
          time: new Date().getTime() + 30000,
          text: object.text
        };
        rooms.push(room);
        socket.emit('text', room);
        playerRoom[socket] = rooms.indexOf(room);
        playersInRoom[rooms.indexOf(room)] = [socket.id];
      });
    }

    socket.on('playerStats', function(data) {
      socket.broadcast.to(rooms[playerRoom[socket]]).emit('playerStatsData', {
        player: socket.id,
        stats: data
      });
    });
  });
}
