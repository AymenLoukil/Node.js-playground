var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();
var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/');
// all environments
app.use(passport.initialize());
app.use(passport.session());
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({ secret: 'SECRET' }));

var FbUserSchema = new mongoose.Schema({
    fbId: String,
    email: { type : String , lowercase : true},
    name : String,
    nameP : String
});

var FaceUsers = mongoose.model('fbu',FbUserSchema);
passport.use(new FacebookStrategy({
	
	//Ajouter les paramètres de votre application, garder le URL pour tester en local. Sur Facebook, mettez localhost comme domaine
    clientID: "",
    clientSecret: "",
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    FaceUsers.findOne({fbId : profile.id}, function(err, oldUser){
        console.log(profile);
        console.log('Je suis  :'+profile.displayName);

        if(oldUser){
            done(null,oldUser);
        }else{
            var newUser = new FaceUsers({
                fbId : profile.id ,
                email : profile.emails[0].value,
                name : profile.displayName,
                nameP : profile.username
            }).save(function(err,newUser){
                if(err) throw err;
                done(null, newUser);
            });
        }
    });
  }
));


passport.serializeUser(function(user, done) {
    
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    FaceUsers.findById(id,function(err,user){
        if(err) done(err);
        if(user){
            done(null,user);
        }else{
            Users.findById(id, function(err,user){
                if(err) done(err);
                done(null,user);
            });
        }
    });
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get("/auth/facebook", passport.authenticate('facebook', { scope: ['email','read_stream', 'publish_actions'] }));

app.get("/auth/facebook/callback",
    passport.authenticate("facebook",{ failureRedirect: '/login'}),
    function(req,res){
        res.render("loggedin", {user : req.user});
    }
);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
