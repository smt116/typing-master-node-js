/*jshint node: true */
'use strict';

var socketio = require('socket.io'),
    model = require('../models/text'),
    rooms = require('./rooms')(rooms);

var playerRoom = {};
var playersInRoom = [];

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
};

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
        var roomIndex = room._id;

        socket.emit('text', room, roomIndex);

        playerRoom[socket.id] = roomIndex;
        playersInRoom[roomIndex] = [socket.id];
        socket.join(room._id);

        startCountingTime(socket, room.time);
      };

      var findRandom = function(callback) {
        model.Text.findRandomText(function(object) {
          var room = {
            time: new Date().getTime() + (timeToStart * 1000),
            text: object.text,
            category: object.category,
          };
          rooms.addRoom(room, callback);
        });
      };

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
              category: object.category,
            };
            rooms.addRoom(room, callback);
          }
        });
      }
    };

    var joinRoom = function(room) {
      socket.join(room._id);
      socket.emit('text', room, room._id);

      playerRoom[socket.id] = room._id;
      if(typeof playersInRoom[room._id] === 'undefined') {
        playersInRoom[room._id] = [socket.id];
      } else {
        playersInRoom[room._id].push(socket.id);
      }

      socket.broadcast.to(room._id).emit('playerStatsInit', {
        player: socket.id,
      });

      socket.emit('playersInRoom', {
        players: playersInRoom[room._id],
        current: socket.id
      });

      startCountingTime(socket, room.time);
    };

    var cleanUserRoom = function() {
      var roomId = playerRoom[socket.id];

      socket.leave(roomId);
      if(typeof playersInRoom[roomId] !== 'undefined') {
        if(playersInRoom[roomId].indexOf(socket.id)) {
          delete playersInRoom[roomId][playersInRoom[roomId].indexOf(socket.id)];
        }
        if(playersInRoom[roomId].length === 0) {
          delete playersInRoom[roomId];
        }
      }
    };

    var joinRandomRoom = function() {
      rooms.getFutureRooms(function(allRooms) {
        for(var index in allRooms) {
          if(allRooms[index] !== 'undefined') {
            var timeDiff = allRooms[index].time - new Date().getTime();
            if(timeDiff > 10000 && timeDiff < 30000) {
              joinRoom(allRooms[index]);
              return false;
            }
          }
        }
        if(createNew) {
          createNewRoom(30);
        }
      });
    };

    socket.on('disconnect', function() {
      rooms.getRooms(function(allRooms) {
        for(var index in allRooms) {
          if(typeof playersInRoom[allRooms[index]._id] !== 'undefined') {
          var roomId = allRooms[index]._id;
            if(playersInRoom[roomId].indexOf(socket.id)) {
              socket.leave(roomId);
              delete playersInRoom[roomId][playersInRoom[roomId].indexOf(socket.id)];
            }
          }
        }
      });
    });

    socket.on('createRoom', function(userTimeToStart, category) {
      createNewRoom(userTimeToStart, category);
    });

    socket.on('joinRoom', function(roomId) {
      rooms.getRoom(roomId, function(room) {
        cleanUserRoom();
        if(room && room.time - new Date().getTime() > 10000) {
          joinRoom(room);
        } else {
          joinRandomRoom();
        }
      });
    });

    socket.on('join', function() {
      cleanUserRoom();
      joinRandomRoom();
    });

    socket.on('playerStats', function(data) {
      rooms.getRoom(playerRoom[socket.id], function(room) {
        socket.broadcast.to(room._id).emit('playerStatsData', {
          player: socket.id,
          stats: data
        });
      });
    });
  });
};
