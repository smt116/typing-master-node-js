var mongoose = require('mongoose');

exports.textSchema = mongoose.Schema({
  random: Number,
  title: String,
  category: String,
  text: String
});
