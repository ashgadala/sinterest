import * as express from 'express';
var app = express();
import * as nunjucks from 'nunjucks';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import * as mongoose from 'mongoose';
import fav = require('./favicon');

// Configure
app.use(express.static('views'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'Shhh.. This is a secret' }));
app.use(passport.initialize());
app.use(passport.session({ secret: 'Shhh.. This is a secret', cookie: { secure: true } }));
app.use(fav);
// Nunjucks
nunjucks.configure('views', {
  autoescape: true,
  express   : app
});


// Mongoose Connection 
mongoose.connect('mongodb://tejas:70421@ds127132.mlab.com:27132/my_pinterest');
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Models
import User = require('./models/users');
import Pin  = require('./models/pins');

// Passport twitter suthentication:
var TwitterStrategy = require('passport-twitter').Strategy;

passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

passport.use(new TwitterStrategy({
    consumerKey: 'wSpyuo23PqU7pt28GifoUvpgr',
    consumerSecret: 'YprEH3hFegOGiMjkxaIYFdVe1DtxIS2u5xx5Tof3vWdkJ3DRQG',
    callbackURL: "	http://127.0.0.1:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function() {
        User.findOne({ 'twitterID': profile.id }, function(err, user) {
            if(err) throw err;
            if(user) {
                return done(null, user);
            } else {
                // create new user
                var newUser = new User();
                newUser.twitterID = profile.id;
                newUser.token = token;
                newUser.username = profile.username;
                newUser.displayname = profile.displayname;

                newUser.save(function(err) {
                    if(err) throw err;
                    return done(null, newUser);
                })
            }
        })
    });
  }
));


// Routes

app.get('/*', function(req, res, next) {
    if (req.headers.host.match(/^www\./) != null) {
      res.redirect("http://" + req.headers.host.slice(4) + req.url, 301);
    } else {
      next();
    }
});

// To Log in
app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/home',
    failureRedirect: '/'
}));

app.get('/', function(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/home');
    }
    res.render('index.html');
});

app.get('/home', function(req, res, next) {
    if(!req.isAuthenticated()) {
        return res.render('index.html');
    }
    Pin.find({ username: req.user.username }).select({ title:1, url:1, username:1 }).exec(function(err, pins) {
            console.log(pins);
            res.render('home.html', { pin: pins });
    });
    
});

app.get('/profile', function(req, res, next) {
    res.render('profile.html', { name:req.user.username });
});

app.post('/submit', function(req, res, next) {
    var entry = new Pin({
        title: req.body.title,
        url: req.body.url,
        username: req.user.username
    });
    entry.save(function(err, data) {
        if(err) throw err;
        res.redirect('/home');
    });
});

app.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});


app.listen(process.env.PORT || 3000);


export = { express, app, nunjucks, bodyParser, cookieParser, session, passport, mongoose, fav };
