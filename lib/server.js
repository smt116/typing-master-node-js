var socketio = require('socket.io'),
    model = require('../models/text');

var rooms = []

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
      if(rooms[index].time - time > 5000) {
        socket.join(rooms[index]);
        createNew = false;
        socket.emit('text', rooms[index]);
        break;
      }
    }
    if(createNew) {
      model.Text.findRandomText(function(object) {
        var room = {
          time: new Date().getTime() + 10000,
          text: object.text
        };
        rooms.push(room);
        socket.emit('text', room);
      });
    }
  });
}
