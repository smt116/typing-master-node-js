var model = require('../models/text');

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
    res.render('index', { categories: categories });
  });
};
