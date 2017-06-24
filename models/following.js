"use strict";
var mongoose = require("mongoose");
var followingSchema = new mongoose.Schema({
    userId: String,
    following_users: []
});
module.exports = mongoose.model('following', followingSchema);
