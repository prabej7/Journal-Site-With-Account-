

require('dot-env');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(session({
    secret: 'keyboard',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/UserDB');

const postSchema = mongoose.Schema({
    posts: String
});

const Post = mongoose.model('post', postSchema);

const userSchema = mongoose.Schema({
    email: String,
    password: String,
    userPosts: [postSchema]
});



userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("user", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
    res.render('index');
});

let warning = "";
let warning2 = "";
app.get('/register', (req, res) => {
    res.render('register',{error1: warning});
});

app.post('/register', (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (req, res, (err, user) => {
        if (err) {
            console.log("User already exists");
            warning = "User alreday exists";
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/account');
            });
        }
    }));
});

app.get('/login', (req, res) => {
    res.render('login',{error2: warning2});
});

app.post('/login', (req, res) => {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(newUser, (err) => {
        if (err) {
            console.log(err);
            res.redirect('/login');
        } else {
            passport.authenticate('local')(req,res,()=>{
                res.redirect('/account');
            });

        }
    });
});

app.get('/account', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('account', { posts: req.user.userPosts });
    } else if(req.isUnauthenticated()){
        warning2 = "Email or password is wrong!";
        res.redirect('/login');
    }

});

app.post('/account', (req, res) => {
    console.log(req.body.postC);
    const newPost = new Post({
        posts: req.body.postC
    });
    newPost.save().then((savedPost, err) => {
        if (err) {
            console.log(err);
            res.redirect('/account');
        } else {
            req.user.userPosts.push(savedPost);
            req.user.save().then((err) => {
                if (err) {
                    console.log(err);
                }
                res.redirect('/account');
            });
        }
    });

});

app.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


app.listen(3000, () => {
    console.log("Server is runnig at port 3000");
});