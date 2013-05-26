var model = require('../models/text');

exports.index = function(req, res) {
  var rand = Math.random();
  var text = model.Text.findOne({
    random: { $gte: rand }
  }, function(err, object) {
    res.render('play', {
      text: object.text
    });
  });
};
