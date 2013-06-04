var mongoose = require("mongoose"),
    schema = require("../db/schema");

mongoose.model('Room', schema.roomSchema);
exports.Room = mongoose.model("Room");
