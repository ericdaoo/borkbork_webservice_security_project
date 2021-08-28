const express = require("express");
const bodyParser = require("body-parser"); //middleware to build upon express
const path = require('path')
const formidable = require("formidable");
const fs = require("fs")
const router = express.Router();
const app = express();
const limit = require('express-limit').limit;
const fse = require('fs-extra');
const sql = require("./app/models/db.js");
//// Start Security module ====== library declare =======
const jwt = require('jsonwebtoken');
const passport = require('passport');
const session = require('cookie-session');
const cookieParser = require('cookie-parser');
//// End Security module ====== library declare =======

app.use(express.static(__dirname + '/public'));

// parse requests of content-type: application/json
app.use(bodyParser.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//// Start Security module ====== Google Passport declare =======
const { signin, refresh } = require('./authentication')
//const {google, callback, success, failure} = require('./googleauth')
const { verify } = require('./middleware')
//set passport strategy
var GoogleStrategy = require('passport-google-oauth2').Strategy;
passport.use(new GoogleStrategy({
  clientID: '534108492780-0lj1ulnh4e9f621ld77qhfmshvjcpjgo.apps.googleusercontent.com',
  clientSecret: '3jdCpKKsacnGYFvYSl2S5CCs',
  callbackURL: 'https://borkbork.herokuapp.com/auth/google/callback'
},
  function (accessToken, refreshToken, profile, done) {
    var user = {
      id: profile.id,
      token: accessToken
    };
    try {
      console.log(user);
      done(null, user);
    } catch (error) {
      console.log(error);
    }
  }
));
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(session({
  secret: 'ilovedogs',
  expires: new Date(Date.now() + (86400 * 1000)),
  resave: true,
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

//// End Security module ====== Google Passport declare=======


//// Start Security module ====== Google Login =======
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, 'app/views/login.html'));
});

app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }), (req, res) => {
  console.log("Logging in via Google");
});

app.get('/auth/google/callback', passport.authenticate('google', { scope: ['email', 'profile'] }), (req, res) => {
  console.log(req.user);
  console.log('Callback landed');
  // Passportjs sends back the user attached to the request object, I set it as part of the session
  req.session.user = req.user;
  //sign jwt
  let accessToken = jwt.sign({ userId: req.user.id }, '524d4c5d7a2c71af42dfaf9094e93a029ffb8bfb1885444a986852dd62fc4d0a', {
    algorithm: "HS512",
    expiresIn: 86400
  });
  res.cookie("user", req.user.id, { secure: true, httpOnly: true, path: '/' })
  res.cookie("jwt", accessToken, { secure: true, httpOnly: true, path: '/' })
  // Redirect to budgeteer after the session has been set
  res.redirect("/");
});

app.get('/logout', function (req, res) {
  req.session = null;
  res.clearCookie('jwt', { secure: true, httpOnly: true, path: '/' });
  res.redirect('/login'); //Inside a callback… bulletproof!
});

//testing 

// app.get("/image_check", (req, res) => {
//   //res.send("hello")
//   try {
//     if (!fs.existsSync("public/images_test")) {
//       res.send("backup_down")
//       // fse.copy("public/backup_images", "public/images");
//       // console.log("image database is down, switching over to backup databse");
//     }
//   }
//   catch (err) {
//     console.error(err)
//   }
// }
// );





app.get("/", verify, limit({
  max: 20,        // 20 requests
  period: 60 * 1000 // per minute (60 seconds)
}), (req, res) => {
  res.sendFile(path.join(__dirname, 'app/views/index.html'));
});
app.get("/about", verify, limit({
  max: 20,
  period: 60 * 1000
}), (req, res) => {
  res.sendFile(path.join(__dirname, 'app/views/about.html'));
});
app.get("/contact", verify, limit({
  max: 20,
  period: 60 * 1000
}), (req, res) => {
  res.sendFile(path.join(__dirname, 'app/views/contact.html'));
});

//app.use(express.limit('10mb'));
//connect to routes

require("./app/routes/post.routes.js")(app);

// set port, listen for requests
app.listen(80, () => {
  console.log("Server is running on port 80.");
});