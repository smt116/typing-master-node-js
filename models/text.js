/*jshint node: true */
'use strict';

var mongoose = require("mongoose"),
    schema = require("../db/schema");

mongoose.model('Text', schema.textSchema);
exports.Text = mongoose.model("Text");

exports.Text.findRandomText = function(callback) {
  var rand = Math.random();

  mongoose.model("Text").findOne({
    random: { $gte: rand }
  }, function(err, object) {
    if(object === null) {
      mongoose.model("Text").findOne({
        random: { $lte: rand }
      }, function(err, object) {
        callback(object);
      });
    } else {
      callback(object);
    }
  });
};
