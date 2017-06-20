"use strict";
var favicon = require("serve-favicon");
var path = require("path");
var fav = favicon(path.join(__dirname, './views/img', 'favicon.png'));
module.exports = { fav: fav };
