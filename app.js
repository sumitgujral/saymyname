const express = require('express');
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/post');
const jwt = require('jsonwebtoken');
const bcrypt =require('bcrypt');
const path = require('path');
const cookieParser = require('cookie-parser');
const upload = require('./configs/multerconfig/multerconfig');
const user = require('./models/user');


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));


app.set('view engine','ejs')

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/register', async (req, res)=> {
    let {username, name, password, age, email } = req.body;

    let user = await await userModel.findOne({email})
    
    if(user) {
        return res.status(500).send('user already exixts');
    }

    bcrypt.genSalt(10, async (err,salt)=>{
        bcrypt.hash(password,salt,(err,hash)=>{
            let user = userModel.create({
            username,
            name,
            age,
            email,
            password : hash
        })
    
        let token = jwt.sign({email:email, userid : user._id},"secretkey")
            res.cookie('token',token);
            res.send('user created login you account at /login')
        })
    })
})

app.get('/login', (req, res) => {
    res.render('login')
  })

app.post('/login', async (req, res) => {
    let {password,email } = req.body;

    let user = await await userModel.findOne({email})
    
    if(!user) {
        return res.status(500).redirect('/login');
    }

    bcrypt.compare(password, user.password, function(err, result) {
        if(result) { 
            let token = jwt.sign({email:email, userid : user._id},"secretkey")
            res.cookie('token',token);
            res.status(300).redirect('/profile')
        }
            else res.redirect('/login')
    }
    )
    }); 

app.get('/logout',(req,res)=>{
    res.cookie('token',"")
    res.status(200).redirect('/login')
})
app.get('/profile',isLoggedIn,async (req,res)=>{
    let user = await userModel.findOne({'email':req.user.email}).populate('posts');
    // let post = await postModel.findOne({'user':user._id}).populate('user');
    // console.log(post);
    res.render('profile',{user});
}
);

app.post('/post',isLoggedIn, async (req,res)=>{
    let {content} = req.body
    let user = await userModel.findOne({email:req.user.email})

    let post = await postModel.create({
        user: user._id,
        content
    });

    user.posts.push(post._id)
    await user.save();
    res.redirect('/profile')
})

app.get('/edit/:id',isLoggedIn, async (req,res)=>{
   let post = await postModel.findOne({_id :req.params.id})
    res.render('edit',{post})
})

app.post('/update/:id',isLoggedIn, async (req,res)=>{
    let updatedpost = await postModel.findOneAndUpdate({_id :req.params.id},{content:req.body.content})
    res.redirect('/profile')
 })
 

 app.get('/like/:id',isLoggedIn, async (req,res)=>{
    let post = await postModel.findOne({_id :req.params.id}).populate('user');

    if (post.likes.indexOf(req.user.userid)===-1) {
        post.likes.push(req.user.userid)
    }else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    await post.save()
    res.redirect('/profile');
 })

 app.get('/delete/:id',isLoggedIn, async (req,res)=>{
    let post = await postModel.findOneAndDelete({_id :req.params.id});
    res.redirect('/profile');
 })

app.get('/profile/upload',isLoggedIn,(req,res)=>{
    res.render('upload')
})

app.post('/upload',isLoggedIn,upload.single('imagepfp'), async(req,res)=>{
    // console.log(req.file);
    let user = await userModel.findOne({email:req.user.email})
    // console.log(user);
    user.profilepfp = req.file.filename;
    await user.save();
    res.redirect('/profile')
})

function isLoggedIn(req,res,next){
if(req.cookies.token===""){
     return res.redirect("/login")
}
else{
    let data = jwt.verify(req.cookies.token,'secretkey');
        req.user = data;
        next();
    }
}

app.listen(3000, () => {
    console.log(`app is running `)
})