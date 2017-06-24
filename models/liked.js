"use strict";
var mongoose = require("mongoose");
var likeSchema = new mongoose.Schema({
    userId: String,
    liked: [String]
});
module.exports = mongoose.model('likes', likeSchema);
