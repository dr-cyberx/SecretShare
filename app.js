const express = require('express');
const bodyparser = require('body-parser');
const _ = require('lodash');
const ejs = require('ejs');
const mongoose = require('mongoose');
const blogs = require(__dirname + '/defaultBlog.js');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

// const saltRounds = 10;

mongoose.connect('mongodb+srv://drcyberx:drcyberx@cluster0.ee8yf.mongodb.net/BackLash', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);



const hostname = '127.0.0.1';
const port = 3000;


const app = express();

// ===================================middleware===================================

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));


app.use(session({
   secret: 'Our little secret',
   resave: false,
   saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

//===================================schema section=================================

const userSchema = new mongoose.Schema({
   Title: {
      type: String
   },
   Content: {
      type: String
   }
});

const loginUserSchema = new mongoose.Schema({
   Username: {
      type: String
   },
   Password: {
      type: String
   }
});

loginUserSchema.plugin(passportLocalMongoose);

//===================================schema section===================================


// ===================================model section===================================

const userModel = mongoose.model('SecretUser', userSchema);
const loginUserModel = mongoose.model('UserData', loginUserSchema);

passport.use(loginUserModel.createStrategy());

passport.serializeUser(loginUserModel.serializeUser());
passport.deserializeUser(loginUserModel.deserializeUser());

// ===================================model section===================================

// const DefaultBlog = blogs;

const b1 = new userModel(blogs.b1());

const b2 = new userModel(blogs.b2());

const b3 = new userModel(blogs.b3());

const arr = [b1, b2, b3];



// ==================================routes==================================

app.get('/', function (req, res) {
   res.redirect('/login');
})

app.get('/home', (req, res) => {


   if (req.isAuthenticated()) {
      userModel.find({}, (err, result) => {

         if (result.length === 0) {
            userModel.insertMany(arr, function (error, found) {
               if (!error) {
                  res.redirect('/');
               }
            })
         } else {
            res.render('home', { list: result })
         }
      })
   } else {
      console.log('authentication failed');
      res.redirect('/login');

   }
});

app.get('/compose', (req, res) => {
   if (req.isAuthenticated()) {
      res.render('compose')
   } else {
      res.redirect('/login');
   }

});

app.post('/home', (req, res) => {
   const title = req.body.posttitle;
   const content = req.body.postContent;

   const user = new userModel({
      Title: title,
      Content: content
   });

   user.save();
   res.redirect('/home')
});

app.get('/contact', function (req, res) {
   res.render('contact');
});

app.get('/about', function (req, res) {
   res.render('about')
});

app.get('/signup', function (req, res) {
   res.render('signup');
});

app.get('/login', function (req, res) {
   res.render('login');
});

app.post('/login', function (req, res) {

   const user = new loginUserModel({
      username: req.body.username,
      password: req.body.password
   });

   req.login(user, function (error) {
      if (error) {
         console.log("line no 172" + error);
         res.redirect('/login')
      } else {
         passport.authenticate('local')(req, res, function () {
            res.redirect('/home');
         });
      }
   });
});


app.post('/signup', function (req, res) {

   loginUserModel.register({ username: req.body.username }, req.body.password, function (error, result) {
      if (error) {
         console.log(error);
         res.redirect('/signup');
      } else {
         passport.authenticate('local')(req, res, function () {
            res.redirect('/home');
         })
      }
   });

});

app.get('/logout', function (req, res) {
   req.logout();
   res.redirect('/login');
});

app.get("/:id", function (req, res) {
   const route = _.capitalize(_.camelCase(req.params.id));
   userModel.find({}, function (err, docs) {
      if (!err) {
         docs.forEach(function (doc) {
            if (route === _.capitalize(_.camelCase(doc.Title))) {
               res.render('post', { item: doc })
            }
         })
      }
   })
});


app.listen(process.env.PORT ,  () => {
   // console.log(`The server is running at http://${hostname}:${port}`);
});
