exports.index = function(req, res) {
  var category = req.param('category'),
      timeToStart = req.param('time'),
      roomId = req.param('room');

  if(typeof timeToStart !== 'undefined' && (timeToStart > 10 && timeToStart < 240)) {
    timeToStart = parseInt(timeToStart);
  } else {
    timeToStart = 30;
  }

  if(typeof roomId === 'undefined') {
    roomId = false;
  } else {
    roomId = parseInt(roomId);
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
};
