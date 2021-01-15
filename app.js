const express = require('express');
const bodyparser = require('body-parser');
const _ = require('lodash');
const ejs = require('ejs');
const mongoose = require('mongoose');
const blogs = require(__dirname + '/defaultBlog.js');

mongoose.connect('mongodb://127.0.0.1:27017/secretShare', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

const hostname = '127.0.0.1';
const port = 3000;


const app = express();

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));


//===================================schema section===================================

const userSchema = new mongoose.Schema({
   Title: {
      type: String
   },
   Content: {
      type: String
   }
});

const loginUserSchema = new mongoose.Schema({
   Email: {
      type: String
   },
   Password: {
      type: String
   }
});

//===================================schema section===================================



// ===================================model section===================================

const userModel = mongoose.model('SecretUser', userSchema);
const loginUserModel = mongoose.model('UserData', loginUserSchema);

// ===================================model section===================================

const DefaultBlog = blogs;

const b1 = new userModel(blogs.b1());

const b2 = new userModel(blogs.b2());

const b3 = new userModel(blogs.b3());

const arr = [b1, b2, b3];



// ==================================routes==================================

app.get('/', (req, res) => {
   userModel.find({}, (err, result) => {

      if (result.length === 0) {
         userModel.insertMany(arr, function (error, found) {
            if (!error) {
               res.redirect('/');
               // console.log('error' + error);
            }
         })
      } else {
         res.render('home', { list: result })
         console.log(result);
      }
   })
});

app.get('/compose', (req, res) => {
   res.render('compose')
});

app.post('/', (req, res) => {
   const title = req.body.posttitle;
   const content = req.body.postContent;

   console.log(title)
   console.log(content)
   const user = new userModel({
      Title: title,
      Content: content
   });

   user.save();
   res.redirect('/')
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
   const username = req.body.userEmail;
   const password = req.body.userPassword;
   loginUserModel.findOne({Email : username} , function(err , docs){
      if(docs){
         res.redirect('/');
      }else{
         res.redirect('/login');
      }
   });
   // res.render('login');
});


app.post('/signup', function (req, res) {
   const username = req.body.userEmail;
   const password = req.body.userPassword;
   const User = new loginUserModel({
      Email: username,
      Password: password
   });
   User.save();
   res.redirect('/');
});

app.get("/:id", function (req, res) {
   const route = _.capitalize(_.camelCase(req.params.id));
   userModel.find({}, function (err, docs) {
      if (!err) {
         docs.forEach(function (doc) {
            if (route === _.capitalize(_.camelCase(doc.Title))) {
               res.render('post', { item: doc })
               // console.log('hello world');
            }
         })
      }
   })
   // res.redirect('/')
});


app.listen(port, hostname, () => {
   console.log(`The server is running at http://${hostname}:${port}`);
});
