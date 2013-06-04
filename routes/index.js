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
    rooms.getFutureRooms(function(allRooms) {
      res.render('index', {
        categories: categories,
        rooms: allRooms
      });
    });
  });
};
