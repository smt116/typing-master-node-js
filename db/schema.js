/*jshint node: true */
'use strict';

var mongoose = require('mongoose');

exports.textSchema = mongoose.Schema({
  random: Number,
  title: String,
  category: String,
  text: String
});

exports.roomSchema = mongoose.Schema({
  time: Number,
  text: String,
  category: String
});
