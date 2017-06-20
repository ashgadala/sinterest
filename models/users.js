"use strict";
var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
    twitterID: String,
    token: String,
    username: String,
    displayname: String
});
module.exports = mongoose.model('user', userSchema);
