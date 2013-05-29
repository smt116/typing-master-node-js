var model = require('../models/text');

var getRandomItem = function(callback) {
  var rand = Math.random();

  model.Text.findOne({
    random: { $gte: rand }
  }, function(err, object) {
    if(object === null) {
      model.Text.findOne({
        random: { $lte: rand }
      }, function(err, object) {
        callback(object);
      });
    } else {
      callback(object);
    }
  });
}

exports.index = function(req, res) {
  getRandomItem(function(object) {
    res.render('play', {
      text: object.text
    });
  });
};
