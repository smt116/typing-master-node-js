var model = require('../models/text');

exports.index = function(req, res) {
  model.Text.findRandomText(function(object) {
    var arg = parseInt(req.params[2]),
        timeToStart = false,
        roomId = false

    switch(req.params[1]) {
      case 'room':
          roomId = arg;
        break;
      case 'time':
        if(arg > 10 && arg < 240) {
          timeToStart = arg;
    }
        break;
    }

    res.render('play', {
      timeToStart: timeToStart,
      roomId: roomId
    });
  });
};
