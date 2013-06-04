/*jshint node: true */
'use strict';

var mongoose = require("mongoose"),
    schema = require("../db/schema");

mongoose.model('Text', schema.textSchema);
exports.Text = mongoose.model("Text");

exports.Text.findRandomText = function(callback, category) {
  var rand = Math.random();

  mongoose.model("Text").findOne({
    category: category,
    random: { $gte: rand }
  }, function(err, object) {
    if(object === null) {
      mongoose.model("Text").findOne({
        category: category,
        random: { $lte: rand }
      }, function(err, object) {
        callback(object);
      });
    } else {
      callback(object);
    }
  });
};
