const express = require('express');
const bodyparser = require('body-parser');
const _ = require('lodash');
const ejs = require('ejs');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/secretShare', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

const hostname = '127.0.0.1';
const port = 3000;


const app = express();

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));


const userSchema = new mongoose.Schema({
   Title: {
      type: String
   },
   Content: {
      type: String
   }
});

const userModel = mongoose.model('SecretUser', userSchema);

const b1 = new userModel({
   Title: 'Day-1',
   Content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt repellendus facere iste quam, exercitationem delectus possimus pariatur similique quod cum asperiores aliquid reiciendis et, repudiandae adipisci aspernatur vero veritatis nobis recusandae enim hic vitae suscipit minus inventore? Quos quidem magni minima ducimus, accusantium repellendus labore illum pariatur fugit, et vero.'
});

const b2 = new userModel({
   Title: 'Day-2',
   Content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt repellendus facere iste quam, exercitationem delectus possimus pariatur similique quod cum asperiores aliquid reiciendis et, repudiandae adipisci aspernatur vero veritatis nobis recusandae enim hic vitae suscipit minus inventore? Quos quidem magni minima ducimus, accusantium repellendus labore illum pariatur fugit, et vero.'
});

const b3 = new userModel({
   Title: 'Day-3',
   Content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt repellendus facere iste quam, exercitationem delectus possimus pariatur similique quod cum asperiores aliquid reiciendis et, repudiandae adipisci aspernatur vero veritatis nobis recusandae enim hic vitae suscipit minus inventore? Quos quidem magni minima ducimus, accusantium repellendus labore illum pariatur fugit, et vero.'
});

const arr = [b1, b2, b3];

app.route('/')

   .get((req, res) => {
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
         }
      })
   });

app.route('/compose')

   .get((req, res) => {
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
   // res.redirect('/')
});


app.listen(port, hostname, () => {
   console.log(`The server is running at http://${hostname}:${port}`);
});
