var socketio = require('socket.io');

    var model = require('../models/text');
// {
//   uid
//   time
// }
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
    console.log('Socket party!');
    var createNew = true;
    for(index in rooms) {
      var time = new Date().getTime();
      if(rooms[index].time - time > 5000) {
        console.log(rooms[index].time - time);
        socket.join(rooms[index]);
        createNew = false;
        socket.emit('text', rooms[index].text);
        break;
      }
    }
    if(createNew) {
      model.Text.findRandomText(function(object) {
        rooms.push({
          time: new Date().getTime() + 10000,
          text: object.text
        });
        socket.emit('text', object.text);
      });
    }
    console.log(rooms);
  });
}
