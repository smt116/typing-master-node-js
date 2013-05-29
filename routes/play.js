var model = require('../models/text');

exports.index = function(req, res) {
  model.Text.findRandomText(function(object) {
    res.render('play');
  });
};
