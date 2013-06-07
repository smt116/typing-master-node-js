/*jshint node: true */
'use strict';

var socketio = require('socket.io'),
    model = require('../models/text'),
    rooms = require('./rooms')(rooms);

var playerSession = {}
var playerRoom = {};
var playersInRoom = [];

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
    var createNewRoom = function(timeToStart, category) {
      var setVariables = function(room) {
        var roomId = room._id;

        socket.emit('text', room, roomId);

        playerRoom[playerSession[socket.id]] = roomId;
        playersInRoom[roomId] = [playerSession[socket.id]];
        socket.join(roomId);
      };

      var findRandomTextAndAddRoom = function(callback) {
        model.Text.findRandomText(function(object) {
          var room = {
            time: timeToStart * 1000,
            text: object.text,
            category: object.category,
          };
          rooms.addRoom(room, callback);
        }, /^(.+)$/);
      };

      if(typeof category === 'undefined') {
        findRandomTextAndAddRoom(setVariables);
      } else {
        model.Text.findRandomText(function(object) {
          if(object === 'undefined') {
            findRandomTextAndAddRoom(setVariables);
          } else {
            var room = {
              time: timeToStart * 1000,
              text: object.text,
              category: object.category,
            };
            rooms.addRoom(room, setVariables);
          }
        }, category);
      }
    };

    var joinRoom = function(room) {
      socket.join(room._id);
      socket.emit('text', room);

      playerRoom[playerSession[socket.id]] = room._id;
      if(typeof playersInRoom[room._id] === 'undefined') {
        playersInRoom[room._id] = [playerSession[socket.id]];
      } else {
        if(playersInRoom[room._id].indexOf(playerSession[socket.id]) === -1) {
          playersInRoom[room._id].push(playerSession[socket.id]);
        }
      }

      socket.broadcast.to(room._id).emit('playerStatsInit', {
        player: playerSession[socket.id],
      });

      socket.emit('playersInRoom', {
        players: playersInRoom[room._id],
        current: {
          session: playerSession[socket.id],
          socket: socket.id
        }
      });
    };

    var joinRandomRoom = function() {
      rooms.getAccesibleRooms(function(allRooms) {
        for(var index in allRooms) {
          if(allRooms[index] !== 'undefined') {
            var timeDiff = allRooms[index].time - new Date().getTime();
            if(timeDiff > 10000 && timeDiff < 30000) {
              joinRoom(allRooms[index]);
              return false;
            }
          }
        }
        createNewRoom(30);
      });
    };

    socket.on('auth', function(receivedSession) {
      var session = receivedSession;
      if(typeof session === 'undefined' || session === false ||
        typeof playerRoom[playerSession[session]] === 'undefined') {
          session = socket.id
          socket.emit('setSession', session);
      }
      playerSession[socket.id] = session;
    });

    socket.on('disconnect', function() {
      var roomId = playerRoom[playerSession[socket.id]];
      rooms.getRoom(roomId, function(room) {
        if(room !== null && room.time < 10) {
          socket.leave(room._id);
          if(typeof playersInRoom[room._id] !== 'undefined') {
            if(playersInRoom[room._id].indexOf(playerSession[socket.id])) {
              delete playersInRoom[room._id][playersInRoom[room._id].indexOf(playerSession[socket.id])];
            }
            if(playersInRoom[room._id].length === 0) {
              delete playersInRoom[room._id];
            }
          }
        }
      });
    });

    socket.on('createRoom', function(userTimeToStart, category) {
      createNewRoom(userTimeToStart, category);
    });

    socket.on('joinRoom', function(roomId) {
      if(roomId === false) {
        joinRandomRoom();
      } else {
        rooms.getRoom(roomId, function(room) {
          if(room && room.time - new Date().getTime() > 10000) {
            joinRoom(room);
          } else {
            joinRandomRoom();
          }
        });
      }
    });

    socket.on('playerStats', function(data) {
      rooms.getRoom(playerRoom[playerSession[socket.id]], function(room) {
        socket.broadcast.to(room._id).emit('playerStatsData', {
          player: playerSession[socket.id],
          stats: data
        });
      });
    });
  });

  io.sockets.on('authorization', function(data, accept) {
    var secret = 'secret';
    if(process.env.secret !== 'undefined') {
      secret = process.env.secret;
    }

    if(data.headers.cookie) {
      data.cookie = cookie.parse(data.headers.cookie);
      data.sessionID = connect.utils.
      parseSignedCookie(data.cookie['typing-master.sid'], secret);

      if(data.cookie['typing-master.sid'] === data.sessionID) {
        return accept('Cookie is invalid! party is over!', false);
      }
    } else {
      return accept('No cookie, no fun!', false);
    }

    accept('yop.. we can try..', true);
  });
};
