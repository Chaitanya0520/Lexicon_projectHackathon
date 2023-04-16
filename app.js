//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _= require("lodash");
const mongoose = require("mongoose");

//..maintain below order for passport.js(cookies)
const session = require("express-session");
const passport  = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//session Setup
app.use(session({
  secret: 'keyboard cat',
  proxy: true,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());


//NewDB
mongoose.connect("mongodb+srv://admin-chaitanya0520:Chaitanya0520@cluster0.vug6bkh.mongodb.net/blogDB",{useNewUrlParser:true})
.then(() => console.log('Yup!MongoDB Connected...'))
.catch((err) => console.log(err))
//schema
const postSchema = {
  title : String,
  content : String
};
//model
const Post = new mongoose.model("Post" ,postSchema);


//2nd schema ": User"
const userSchema = new mongoose.Schema({   ///***due to encryption */
  email : String, 
  password : String,
  googleId: String,
  secret: String
}); 
//used with above schema..(new mongoose.Schema)
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User",userSchema);

//serialize and deserialize
passport.use(User.createStrategy()); //to create a local login Strategy
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user.id);
    });
  });
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

  //google auth2.0
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "https://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oath2/v3/userinfo"
 },
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
  User.findOrCreate({ googleId: profile.id }, function (err, user) { //from a separate npm package
    return cb(err, user);
  });
}
));

const homeStartingContent = "Achieving financial security in old age through retirement planning should be a crucial goal. For older persons, who have earned money with their hard work and efforts and have self-acquired net-worth, value of money matters most. Older persons with sound financial status live to the fact that consumer is the king and tend to have good value for their money. It has also been observed that financially well-settled older persons prefer to utilize their purchasing power for sake of better life in old age. Financial status of older persons is directly linked with their financial independence. With the increasing nuclearization of family, particularly in the urban settings, more and more older persons tend to be choosing to live on their own and want to utilize their net-worth value to the maximum.";

const aboutContent = "Social media has grown by leaps and bounds, it has brought various benefits simultaneously and has posed serious social media cyber security concerns. It also acts as a vulnerable platform to be exploited by hackers.  Users share their personal information on social media, which can cause privacy breaches. It can also sometimes cause personal data loss or instigate hackers to leverage the same for malicious reasons. The growing individualistic and materialistic considerations among the younger generations due to academic and professional pursuits, the older persons are eventually finding less attached with the younger member of family. A majority of older persons face financial hardship in old age as most of them are not in a position to earn their livelihood. Their savings, if any, are not enough to meet their day to day, particularly the medical expenses. Many a times their family members and relatives exploit them due to their vulnerability";




app.get("/", function(req,res){
  res.redirect("/interface");
   
});

app.get("/interface", function(req,res){
  res.render("interface");
});

app.get("/register", function(req,res){
  res.render("register");
});
app.get("/login", function(req,res){
  res.render("login");
});
app.get("/home", function(req,res){
  Post.find({})
            .then(foundPosts =>{
                res.render("home", {homeStartingContentShow :homeStartingContent, postsArray: foundPosts });
           });
});

app.route('/auth/google')
  .get(passport.authenticate('google', {
    scope: ['profile']
  }));

  app.route('/auth/google/secrets')
   .get(passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect : '/' // Successful authentication, redirect home.
      })
    );




  app.post("/register", function(req,res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
      if(err){
          console.log(err);
          res.redirect("/register");
      } else{
          passport.authenticate("local")(req,res,function(){  //i.e. using local strategy
          res.redirect("/home");
          });
         }
      });
  
  });

  app.post("/login", function(req,res){
    const user = new User({
       username: req.body.username,
       password: req.body.password
    });
    req.login(user,function(err){    //from passsport
       if(err){
           console.log(err);
       } else{
           passport.authenticate("local")(req,res,function(){
            res.redirect("/home");

           });
       }
    });
});

app.get("/about", function(req,res){
  res.render("about",{aboutContentShow : aboutContent});
});




app.get("/compose", function(req,res){
  res.render("compose");
});
app.post("/compose", function(req,res){
    
   
    const post = new Post ({  
      title : req.body.postTitle,
    content : req.body.postBody
  });
  post.save();
  res.redirect("/home");

});

app.get('/posts/:postId', function(req,res){
   
  const requestedPostId = req.params.postId;
    console.log(requestedPostId);

    Post.findOne({_id: requestedPostId})
      .then( foundPost => {res.render("post", {
        title: foundPost.title,
        content: foundPost.content,
        postId : requestedPostId
      });
    })
   
});

app.post('/delete', function(req, res){
  const selectPostId = req.body.deletePostId;

  Post.findByIdAndRemove(selectPostId)
  .then(console.log("Post deleted!"))
  .catch(err=>{console.log(err)});

  res.redirect("/home");

});



let port= process.env.PORT;
if(port== null || port==""){ port = 3000; }
app.listen(port, function(){
  console.log("Server started on port!");
});

