var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var db;

if (process.env.ENV === 'test') {
    db = mongoose.connect('mongodb://localhost/xr_it');
} else {
    db = mongoose.connect('mongodb://localhost/xr');
}

var User = require('./models/userModel');
var Outcome = require('./models/outcomeModel');
var Reflection = require('./models/reflectionModel');
var HotSpotBucket = require('./models/hotSpotBucketModel');

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({'local.username': username}, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(passport.initialize());


// TODO:
// VERIFY TOKEN: https://github.com/jaredhanson/passport-http-bearer
// ALSO SEE: http://stackoverflow.com/questions/17397052/nodejs-passport-authentication-token

var tempSecret = 'to-be-changed'; // TODO: Make secret not hardcoded into the program

var registerRouter = require('./routes/registerRoutes')(User);
var loginRouter = require('./routes/loginRoutes')(User, passport, tempSecret);
var outcomeRouter = require('./routes/outcomeRoutes')(Outcome);
var reflectionRouter = require('./routes/reflectionRoutes')(Reflection);
var hotSpotBucketRouter = require('./routes/hotSpotBucketRoutes')(HotSpotBucket);
var relatedRouter = require('./routes/relatedRoutes')(Outcome, Reflection);
var activeEntriesRouter = require('./routes/activeEntriesRoutes')(Outcome);

app.use('/api/register', registerRouter);
app.use('/api/login', loginRouter);
app.use('/api/outcomes', outcomeRouter);
app.use('/api/reflections', reflectionRouter);
app.use('/api/hotSpotBuckets', hotSpotBucketRouter);
app.use('/api/related', relatedRouter);
app.use('/api/activeEntries', activeEntriesRouter);


var server = app.listen(port);

server.on('close', function () {
    mongoose.connection.close();
});

module.exports = server;