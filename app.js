var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    expressSanitizer      = require("express-sanitizer"),
    methodOverride        = require('method-override'),
    User                  = require("./models/user"),
    Course                 = require("./models/course"),
    passport              = require('passport'),
    util                  = require('util');





    mongoose.connect("mongodb://localhost/smart",  {
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
    res.redirect("/smart");
});

app.get("/smart", function(req, res){
 /*   Anon.find({}, function(err, anons){
        if(err){
            console.log(err);
        } else {
            res.render("index", {anons: anons});
        }
    })*/
    var week=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    res.render("index",{week:week});
});

app.post("/smart", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var body = req.body.body;
    var author = {
           id: req.user._id,
           username: req.user.username
       }

var formData = {title: name, image: image, body:body, author:author}
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
 
            res.redirect("/");
         });
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

 app.get("/logout", function(req, res){
     req.logout();
     res.redirect("/");
 });
 
 

app.listen(3000, function(){
    console.log("server started.......");
})