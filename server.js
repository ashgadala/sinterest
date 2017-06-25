"use strict";
var express = require("express");
var app = express();
var nunjucks = require("nunjucks");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var passport = require("passport");
var mongoose = require("mongoose");
var fav = require("./favicon");
// Configure
app.use(express.static('views'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'Shhh.. This is a secret' }));
app.use(passport.initialize());
app.use(passport.session({ secret: 'Shhh.. This is a secret', cookie: { secure: true }, saveUninitialized: false,
    resave: false }));
app.use(fav);
// Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app
});
// Mongoose Connection 
mongoose.connect('mongodb://tejas:70421@ds127132.mlab.com:27132/my_pinterest');
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
// Models
var User = require("./models/users");
var Pin = require("./models/pins");
var Following = require("./models/following");
var Likes = require("./models/liked");
// Passport twitter suthentication:
var TwitterStrategy = require('passport-twitter').Strategy;
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});
passport.use(new TwitterStrategy({
    consumerKey: 'wSpyuo23PqU7pt28GifoUvpgr',
    consumerSecret: 'YprEH3hFegOGiMjkxaIYFdVe1DtxIS2u5xx5Tof3vWdkJ3DRQG',
    callbackURL: "http://sinterest-fcc.herokuapp.com/auth/twitter/callback"
}, function (token, tokenSecret, profile, done) {
    process.nextTick(function () {
        User.findOne({ 'twitterID': profile.id }, function (err, user) {
            if (err)
                throw err;
            if (user) {
                return done(null, user);
            }
            else {
                // create new user
                var newUser = new User();
                newUser.twitterID = profile.id;
                newUser.token = token;
                newUser.username = profile.username;
                newUser.displayname = profile.displayname;
                newUser.save(function (err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }
        });
    });
}));
// Routes
app.get('/*', function (req, res, next) {
    if (req.headers.host.match(/^www\./) != null) {
        res.redirect("http://" + req.headers.host.slice(4) + req.url, 301);
    }
    else {
        next();
    }
});
// To Log in
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/home',
    failureRedirect: '/'
}));
app.get('/', function (req, res) {
    // if(req.isAuthenticated()) {
    //     return res.redirect('/home');
    //     //res.redirect('/home');
    // }
    res.render('index.html');
});
app.get('/home', function (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    Pin.find({}).select({ _id: 1, title: 1, url: 1, username: 1 }).exec(function (err, pins) {
        console.log(pins);
        return res.render('home.html', { pin: pins });
    });
});
app.get('/profile', function (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    Pin.find({ username: req.user.username }).select({ title: 1, url: 1, username: 1, displayname: 1 }).exec(function (err, pins) {
        console.log(pins);
        res.render('profile.html', { pin: pins });
    });
});
app.get('/profile/:username', function (req, res, next) {
    Pin.find({ username: req.params.username }).select({ title: 1, url: 1, username: 1, displayname: 1 }).exec(function (err, pins) {
        console.log(pins);
        res.render('profile.html', { pin: pins, username: req.params.username });
    });
});
app.post('/submit', function (req, res, next) {
    var entry = new Pin({
        title: req.body.title,
        url: req.body.url,
        username: req.user.username
    });
    entry.save(function (err, data) {
        if (err)
            throw err;
        res.redirect('/home');
    });
});
// Not yet ready
app.get('/follow', function (req, res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    var new_follower = new Following;
    new_follower.userId = req.user.username,
        new_follower.following_users.push(req.param('username'));
    new_follower.save(function (err, data) {
        if (err)
            throw err;
        res.redirect('/home');
    });
});
// Delete
app.get('/delete', function (req, res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    Pin.find({ username: req.user.username }).select({ _id: 1, title: 1, url: 1, username: 1, displayname: 1 }).exec(function (err, pins) {
        console.log(pins);
        res.render('delete.html', { pin: pins });
    });
});
app.get('/api/delete/:id', function (req, res, next) {
    Pin.find({ _id: req.params.id }).remove().exec(function (err, doc) {
        if (err) {
            throw err;
        }
        res.redirect('/home');
    });
});
app.get('/api/like/:id', function (req, res) {
    var new_like = new Likes;
    new_like.userId = req.user.username;
    new_like.liked.push(req.params.id);
    new_like.save(function (err, data) {
        if (err)
            throw err;
        res.redirect('/home');
    });
});
app.get('/logout', function (req, res) {
    console.log('logging out');
    req.logout();
    res.redirect('/');
});
app.listen(process.env.PORT || 3000);
module.exports = { express: express, app: app, nunjucks: nunjucks, bodyParser: bodyParser, cookieParser: cookieParser, session: session, passport: passport, mongoose: mongoose, fav: fav };
