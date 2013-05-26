var mongoose = require("mongoose"),
    schema = require("../db/schema");

exports.Text = mongoose.model("Text", schema.textSchema);
