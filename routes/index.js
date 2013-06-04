var model = require('../models/text'),
    rooms = require('../lib/rooms')(rooms);

exports.index = function(req, res) {
  model.Text.aggregate({
    $group: {
      _id: "$category"
    }
  }, function(err, result) {
    categories = []
    for(var i in result) {
      categories.push(result[i]._id);
    }
    rooms.getAccesibleRooms(function(allRooms) {
      res.render('index', {
        categories: categories,
        rooms: allRooms
      });
    });
  });
}

exports.play = function(req, res) {
  var category = req.param('category'),
      timeToStart = req.param('time'),
      roomId = req.param('room');

  if(typeof timeToStart !== 'undefined' && (timeToStart > 10 && timeToStart <= 240)) {
    timeToStart = parseInt(timeToStart);
  } else {
    timeToStart = false;
  }

  if(typeof roomId === 'undefined') {
    roomId = false;
  } else {
    roomId = "'" + roomId + "'";
  }

  if(typeof category === 'undefined') {
    category = false;
  } else {
    category = "'" + category + "'";
  }

  res.render('play', {
    timeToStart: timeToStart,
    category: category,
    roomId: roomId
  });
}
