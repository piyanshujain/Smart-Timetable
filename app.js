var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    expressSanitizer      = require("express-sanitizer"),
    methodOverride        = require('method-override'),
    User                  = require("./models/user"),
    Course                = require("./models/course"),
    passport              = require('passport'),
    util                  = require('util');
    cookieParser          = require('cookie-parser');
    session               = require('express-session');
    moment                = require('moment');
    querystring           = require('querystring');
    outlook               = require('node-outlook');
    
    var pages = require('./pages');
    var authHelper = require('./authHelper');

var dbConn= mongoose.connect("mongodb://localhost:27017/smart",  {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
    .then(() => console.log('Connected to DB!'))
    .catch(error => console.log(error.message));
    
    var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.use(methodOverride('_method'));
app.use(require("express-session")({
    secret: "Apna timetable khud banao",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Configure express
// Set up rendering of static files
// Need JSON body parser for most API responses
app.use(bodyParser.json());
// Set up cookies and sessions to save tokens
app.use(cookieParser());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });
  
  app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
 });


app.get("/", function(req, res){
    //res.send(pages.loginPage(authHelper.getAuthUrl()));
    var auth= authHelper.getAuthUrl();
    res.render("register", {auth: auth});
});

app.get('/authorize', function(req, res) {
    var authCode = req.query.code;
    if (authCode) {
      console.log('');
      console.log('Retrieved auth code in /authorize: ' + authCode);
      authHelper.getTokenFromCode(authCode, tokenReceived, req, res);
    }
    else {
      // redirect to home
      console.log('/authorize called without a code parameter, redirecting to login');
      res.redirect('/');
    }
  });
  
function tokenReceived(req, res, error, token) {
    if (error) {
      console.log('ERROR getting token:'  + error);
      res.send('ERROR getting token: ' + error);
    }
    else {
      // save tokens in session
      req.session.access_token = token.token.access_token;
      req.session.refresh_token = token.token.refresh_token;
      req.session.email = authHelper.getEmailFromIdToken(token.token.id_token);
      res.redirect('/more');
    }
}
  
app.get('/refreshtokens', function(req, res) {
    var refresh_token = req.session.refresh_token;
    if (refresh_token === undefined) {
      console.log('no refresh token in session');
      res.redirect('/');
    }
    else {
      authHelper.getTokenFromRefreshToken(refresh_token, tokenReceived, req, res);
    }
});
  
app.get('/logout', function(req, res) {
req.session.destroy();
res.redirect('/');
});

app.get("/smart", function(req, res){
    var week=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    res.render("index",{week});
});

app.post("/smart", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var body = req.body.body;
    var author = {
           id: req.user._id,
           username: req.user.username
       }

var formData = {title: name, image: image, body: body, author:author}
   Anon.create(formData, function(err, newAnon){
       console.log(newAnon);
      if(err){
          res.render("new");
      } else {
          res.redirect("/index");
      }
   });
});

//Authentication Routes
app.get("/register", function(req, res){
    res.render("register");
 });

app.post("/register", function(req, res){
     User.register(new User({username: req.body.username}), req.body.password, function(err, user){
         if(err){
             console.log(err);
             return res.render('register');
         }
         passport.authenticate("local")(req, res, function(){
         });
     });
});

 app.get("/more", function(req, res){
    var access_token = req.session.access_token;
    var refresh_token = req.session.access_token;
    var email = req.session.email;
    
    if (access_token === undefined || refresh_token === undefined) {
      console.log('/more called while not logged in');
      res.redirect('/');
      return;
    }
    
    res.render("more", {urmail: email});
 });

 app.post('/more', function (req, res) {
    dbConn.then(function(db) {
        db.collection('smart').insertOne(req.body);
    });    
});

 app.get("/login", function(req, res){
    res.render("login");
 });

 app.post("/login", passport.authenticate("local", {
     successRedirect: "/",
     failureRedirect: "/login"
 }) ,function(req, res){
 });

// Start the server
var server = app.listen(3000, function() {
var host = server.address().address;
var port = server.address().port;

console.log('Example app listening at http://%s:%s', host, port);
});