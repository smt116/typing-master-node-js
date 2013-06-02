var model = require('../models/text');

exports.index = function(req, res) {
  model.Text.findRandomText(function(object) {
    console.log(req.params);
    var timeToStart = parseInt(req.params[0]);
    if(timeToStart > 10 && timeToStart < 240) {
      res.render('play', { timeToStart: timeToStart });
    } else {
      res.render('play', { timeToStart: false });
    }
  });
};
