const express = require('express');
const app = express();
const path = require('path');
const conn = require('./controllers/mongooseconnection')
const userModel = require('./models/userModel');
const postModel = require('./models/postModel');
const commentModel = require('./models/commentModel');
const likeModel = require('./models/likeModel');
const otpverificationModel = require('./models/otpverificationModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const upload = require('./configs/multerconfig')

app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
  secret : process.env.SESSION_SECRET_KEY,
  saveUninitialized : true,
  resave : true
}))
app.use(cookieParser());
app.use(flash());

app.use((req, res, next) => {
  res.locals.errors_msg = req.flash('errors');
  res.locals.success_msg = req.flash('success');
  res.locals.warning_msg = req.flash('warning');
  res.locals.info_msg = req.flash('info');
  res.locals.login_error_msg =  req.flash('login_error');
  res.locals.registration_error_msg =  req.flash('registration_error');
  res.locals.otp_error_msg =  req.flash('otp_error');
  res.locals.invalid_email_error_msg =  req.flash('invalid_email_error');
  res.locals.email_invalid_error_msg =  req.flash('email_invalid_error');  
  res.locals.code_invalid_error_msg =  req.flash('code_invalid_error');
  res.locals.reset_sucess_msg =  req.flash('reset_sucess');
  res.locals.update_success_msg =  req.flash('update_success');
  res.locals.update_error_msg =  req.flash('update_error');
  res.locals.update_optional_success_msg =  req.flash('update_optional_success');
  res.locals.post_success_msg =  req.flash('post_success');


  next();
});


let transporter = nodemailer.createTransport({
  host : "smtp.mailersend.net",
  port: 587,
  auth: {
    user: process.env.SMTP_AUTH_EMAIL,
    pass: process.env.SMTP_AUTH_PASSWORD,
  }
})

let cookieExpiry = new Date(Date.now() + 604800000) // cookie expire after 1 week
let privatekeyforJWT = process.env.PRIVATEKEYJWT;


function isLoggedIn(req,res,next){
  if(req.cookies.loogedincookie===""){
       return res.redirect("/")
  }
  else{
      let data = jwt.verify(req.cookies.loogedincookie, privatekeyforJWT);
      req.user = data;
      next();
      }
  }

function formatDate(inputDateStr) {
    const date = new Date(inputDateStr);
     // Get hours and minutes
     let hours = date.getHours();
     const minutes = date.getMinutes().toString().padStart(2, '0');
 
     // Determine AM/PM and convert to 12-hour format
     const ampm = hours >= 12 ? 'PM' : 'AM';
     hours = hours % 12;
     hours = hours === 0 ? 12 : hours; // 0 becomes 12 in 12-hour format
 
     // Format month, day, and year
     const day = date.getDate();
     const month = date.toLocaleString('default', { month: 'short' });
     const year = date.getFullYear();
 
     return `${hours}:${minutes} ${ampm} - ${month} ${day} ${year}`;
}


app.get('/', async (req, res) => {
  if(req.cookies.loogedincookie){
    return res.redirect('/home')
  }else{
    return res.render('index');
  }
})

app.post('/getotp', async (req,res)=>{
  let {email} = req.body;
  try{
  let otp = Math.floor(`${1000 + Math.random() * 9000}`);
  let expiryDate = new Date(Date.now() + 86400000);
  const mailOptions = {
    from : process.env.SMTP_AUTH_EMAIL,
    to : email,
    subject : "Confirmation code for SayMyName account",
    html : `<div class="flex flex-col justify-between items-center text-white bg-zinc-900 text-center p-5">
                        <p class="text-xl text-center">Greetings,</p>   
                           <p class="text-lg text-center"> Use the below four digits code to verify your email and sign up.</p>
                              <p class="text-sm text-center">Verification Code will exipre on ${expiryDate}</p>
                <div class="text-2xl rounded-2xl m-4 text-zinc-900 font-bold text-center p-5 border-zinc-700 bg-zinc-400">${otp}</div>
                    <p>SayMyName&#174;</p>
            </div>`
        } 

  let emailcheck = await otpverificationModel.findOne({email});
  if(emailcheck){
    await transporter.sendMail(mailOptions,async (error, info) => {
      if (error) {
          console.error('Error sending in privious email:', error);
          req.flash('otp_error',`Issue with ${email} account.`);
          return res.redirect('/')
      } else {
          console.log('Email sent on privious mail:', info.response);
          req.flash('success',`Verification mail is send on ${email}`);
          let emailcheck = await otpverificationModel.updateOne({ email },{ $push: { verificationcodeGenerated: otp } })
          return res.redirect('/')
      }
  });
  }else{
      await transporter.sendMail(mailOptions, async(error, info) => {
      if (error) {
          console.error('Error sending in new email:', error);
          req.flash('otp_error',`Issue with ${email} account.`);
          return res.redirect('/')
      } else {
          console.log('Email sent on new mail:', info.response);
          req.flash('success',`Verification mail is send on ${email}`);
          let newDateFormatted = formatDate(Date.now());
          let verificationcode = await otpverificationModel.create({
            email,
            verificationcodeGenerated : otp,
            createdAt : newDateFormatted,
            expireAt : expiryDate,
          });
          return res.redirect('/')
      }
  }); 
}
  } catch (error){
    console.error('Error in getotp configration : ', error);
  }
})

app.post('/register', async (req,res) =>{
  let {email,username,name,password,verificationcode} = req.body;
    try {
      let userExists = await userModel.findOne({$or : [{username},{email}]})
      if(userExists){
        if(user.email==email){
          req.flash('registration_error','Email Already Exists.') 
        }else{
          req.flash('registration_error','username is already taken.')
        }
        return res.redirect('/')
      }
      
  let verficationcodeData = await otpverificationModel.findOne({email})
  let verificationcodeGeneratedArray = verficationcodeData.verificationcodeGenerated;
  let validOtp = verificationcodeGeneratedArray[verificationcodeGeneratedArray.length-1];
  if(validOtp!=verificationcode)
  {
    req.flash('registration_error','Verification Code is Invalid');
    return res.redirect('/')
  }
  else{
  bcrypt.genSalt(10, async function(err, salt) {
      bcrypt.hash(password, salt, async function(err, hash) {
        let newDateFormatted = formatDate(Date.now());
          let user = await userModel.create({
            email,
            username,
            name,
            password:hash,
            accountCreated : newDateFormatted,
            verificationcode,
            verified : true
          })
          let jwttoken = jwt.sign({ email : user.email , userid : user._id},privatekeyforJWT);
          res.cookie('loogedincookie',jwttoken,{expires: cookieExpiry});
          return res.redirect('/home')
        })
        
      })
      
    }
    
    } catch (error) {
      console.error('Error in register configration : ', error)
    }
})

app.post('/login', async (req, res) => {
  let { usernameoremail, password} = req.body;
  try {
      let existingUser = await userModel.findOne({$or : [{username : usernameoremail},{email :usernameoremail}]})
      if(!existingUser){
        req.flash('login_error','Invalid Email or username ')
        return res.redirect('/')
      }
  hashedpassword = existingUser.password;
  bcrypt.compare(password, hashedpassword, function(err, result) {
    if(result==true){
      let jwttoken = jwt.sign({ email : existingUser.email , userid : existingUser._id },privatekeyforJWT);
      res.cookie('loogedincookie',jwttoken,{expires: cookieExpiry});
      return res.redirect('/home')
      }else{
        req.flash('login_error','Invalid Password');
        return res.redirect('/')
      }
  });
} catch (error) {
    console.error('Error in login configration : ', error)
}
})

app.get('/forgetpassword', (req, res) => {
   res.render('forgetpassword')
})

app.post('/getresetpasswordotp', async (req, res) => {
  let { emailorusername } = req.body;
  let existingUser = await userModel.findOne({$or : [{username : emailorusername},{email : emailorusername}]})
  if(!existingUser){
    req.flash('login_error','Invalid Email or username ')
    return res.redirect('/forgetpassword')
  }
  let otp = Math.floor(`${1000 + Math.random() * 9000}`);
  let expiryDate = new Date(Date.now() + 86400000);
  

  let sendotpbyEmail = await userModel.findOne({email : emailorusername});
    if(sendotpbyEmail){
      let email = sendotpbyEmail.email;
      const mailOptions = {
        from : process.env.SMTP_AUTH_EMAIL,
        to : email,
        subject : "Reset password code for SayMyName account",
        html : `<div class="flex flex-col justify-between items-center text-white bg-zinc-900 text-center p-5">
                            <p class="text-xl text-center">Greetings,</p>   
                               <p class="text-lg text-center"> Use the below four digits code for reset your account password.</p>
                                  <p class="text-sm text-center">Verification Code will exipre on ${expiryDate}</p>
                    <div class="text-2xl rounded-2xl m-4 text-zinc-900 font-bold text-center p-5 border-zinc-700 bg-zinc-400">${otp}</div>
                        <p>SayMyName&#174;</p>
                </div>`
            }
      await transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
          console.error('Error sending in reset password email:', error);
          req.flash('otp_error',`Issue with ${email} account.`);
          return res.redirect('/forgetpassword')
      } else {
          console.log('Email sent on mail:', info.response);
          req.flash('success',`Reset password mail is send on ${email}`);
          await otpverificationModel.updateOne({ email },{ $push: { verificationcoderesetpassword: otp } });
          return res.redirect('/forgetpassword')
      }
  });
  }
    let sendotpbyusername = await userModel.findOne({username : emailorusername});
    if(sendotpbyusername){
       let email = sendotpbyusername.email;
       const mailOptions = {
        from : process.env.SMTP_AUTH_EMAIL,
        to : email,
        subject : "Reset password of your SayMyName account",
        html : `<div class="flex flex-col justify-between items-center text-white bg-zinc-900 text-center p-5">
                            <p class="text-xl text-center">Greetings,</p>   
                               <p class="text-lg text-center"> Use the below four digits code for reset your account password.</p>
                                  <p class="text-sm text-center">Verification Code will exipre on ${expiryDate}</p>
                    <div class="text-2xl rounded-2xl m-4 text-zinc-900 font-bold text-center p-5 border-zinc-700 bg-zinc-400">${otp}</div>
                        <p>SayMyName&#174;</p>
                </div>`
            }
       await transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.error('Error sending in reset password email:', error);
            req.flash('otp_error',`Issue with ${email} account.`);
            return res.redirect('/forgetpassword')
        } else {
            console.log('Email sent on mail:', info.response);
            req.flash('success',`Reset password mail is send on ${email.slice(0,2)+"*".repeat(5 - 2)+email.slice(5)}`);
            await otpverificationModel.updateOne({ email },{ $push: { verificationcoderesetpassword: otp } });
            return res.redirect('/forgetpassword')
        }
    });
    }
})


app.post('/resetpassword', async (req,res) =>{
  let { email, verificationcode, newpassword} = req.body;
  let existsUser = await userModel.findOne({email :email})
      if(!existsUser){
        req.flash('email_invalid_error','Invalid Email')
        return res.redirect('/forgetpassword')
      }
  let verficationcodeData = await otpverificationModel.findOne({email})
  let verificationcoderesetpasswordArray = verficationcodeData.verificationcoderesetpassword;
  let validOtp = verificationcoderesetpasswordArray [verificationcoderesetpasswordArray.length-1];
  if(validOtp!=verificationcode)
  {
    req.flash('code_invalid_error','Verification Code is Invalid');
    return res.redirect('/forgetpassword')
  }else{
    bcrypt.genSalt(10, async function(err, salt) {
      bcrypt.hash(newpassword, salt, async function(err, hash) {
        let userupdatePassword = await userModel.updateOne({email},{
          $set: {
            verificationcode : verificationcode,
            password:hash,
          }
        })
      })
    })
    req.flash('reset_sucess','Password Reset Successful.')
    return res.redirect('/forgetpassword')
  }
})

app.get('/updateprofile',isLoggedIn, async(req, res) => {
  let user = await userModel.findOne({email : req.user.email})
       res.render('updateprofile',{user});
})

app.post('/update',isLoggedIn,upload.single('profileimage'), async (req, res) => {
  let { newname ,newpassword ,profileimage , currentpassword} = req.body;
  let user = await userModel.findOne({email : req.user.email})
  let match =  bcrypt.compare(currentpassword, user.password);
  if(match){
    bcrypt.genSalt(10, async function(err, salt) {
      bcrypt.hash(newpassword, salt, async function(err, hash) { 
        if(req.file){
          let path = req.file.path;
          let pathwithpublic = `/${path.replace(/public\\/, '').replace(/\\/g, '/')}`;
          await userModel.findOneAndUpdate({email : req.user.email}, { $set : {name : newname,password: hash,profileimage: pathwithpublic} })
        }else{
          await userModel.findOneAndUpdate({email : req.user.email}, { $set : {name : newname,password: hash} })
        }   
    })
    }) 
    req.flash('update_success','Profile details updated.')
  }
  else{
    req.flash('update_error','Current password is incorrect.')
  }
    res.redirect('/updateprofile')
})

app.post('/updateoptionaldetails',isLoggedIn, async(req, res) => {
  let {dob, gender, phonenumber, pincode, address, maritalstatus} = req.body;
    await userModel.findOneAndUpdate({email : req.user.email}, {$set : {dob, gender, phoneNumber : phonenumber, pincode, address, maritalStatus : maritalstatus}})
    req.flash('update_optional_success','Optional Profile details updated.')
    res.redirect('/updateprofile')
})

app.post('/create',isLoggedIn,upload.single('fileforpost'), async(req, res) => {
  let {caption} = req.body;
  let user = await userModel.findOne({email : req.user.email})
  if(req.file){
  let path = req.file.path;
  let pathwithpublic = `/${path.replace(/public\\/, '').replace(/\\/g, '/')}`;
  let newDateFormatted = formatDate(Date.now());
  let post = await postModel.create({
    userid : user._id,
    postdata : pathwithpublic,
    caption,
    postCreated : newDateFormatted,
  })
  let pushonuser = await userModel.findOneAndUpdate({email : req.user.email}, { $push : {posts : post._id}});
  req.flash('post_success',"Post is Created.");
}else{
  let newDateFormatted = formatDate(Date.now());
  let post = await postModel.create({
    userid : user._id,
    caption,
    postCreated : newDateFormatted,
})
let pushonuser = await userModel.findOneAndUpdate({email : req.user.email}, { $push : {posts : post._id}});
}

res.redirect(req.headers.referer || '/')
})

app.post('/commentpost/:id',isLoggedIn, async (req,res)=>{
  let  { comment } = req.body;
  let newDateFormatted = formatDate(Date.now());
    let usercomment = await commentModel.create({
    userid : req.user.userid,
    comment,
    post : req.params.id,
    commentCreated : newDateFormatted
  })
  await postModel.findOneAndUpdate({_id : req.params.id}, {$push : {comment : usercomment._id}})
  await userModel.findOneAndUpdate({_id : req.user.userid},{ $push : {comment : usercomment._id}})
  res.redirect(req.headers.referer || '/')
})

app.get('/like/:id',isLoggedIn,async(req,res)=>{
let post = await postModel.findOne({_id :req.params.id}).populate('userid');
let user = await userModel.findOne({_id : req.user.userid})
let like = await likeModel.findOne({_id : req.user.userid})
if (post.likes.indexOf(req.user.userid)===-1) {
      post.likes.push(req.user.userid)
      let newDateFormatted = formatDate(Date.now());
      let like = await likeModel.create({
      userid : req.user.userid,
      post : post._id,
      likeDate : newDateFormatted
      })
      await userModel.findOneAndUpdate({_id : req.user.userid},{ $push : {likes : like._id}})
  }else{
      post.likes.splice(post.likes.indexOf(req.user.userid), 1);
      user.likes.splice(user.likes.indexOf(req.user.userid), 1);  
  }
await post.save()
await user.save()
res.redirect(req.headers.referer || '/')
})

app.get('/delete/:id',isLoggedIn,async(req,res)=>{
      await postModel.findOneAndDelete({_id : req.params.id})
      await userModel.findOneAndUpdate({posts :req.params.id},{$pull : {posts : req.params.id}})
      let comments = await commentModel.find({post : req.params.id})
      let commentIds = comments.map(comment => comment._id);
      await userModel.updateMany({ comment: { $in: commentIds } },{ $pullAll: { comment: commentIds } });
      await commentModel.deleteMany({post : req.params.id})
      let like = await likeModel.findOne({ post: req.params.id });
      await userModel.findOneAndUpdate({likes : like._id},{$pull : {likes : like._id}})
      await likeModel.deleteMany({ post: req.params.id });
      res.redirect(req.headers.referer || '/')
})

app.get('/deletecomment/:id',isLoggedIn, async (req, res) => {
  try {
  let comment = await commentModel.findOne({_id : req.params.id})
  let user = await userModel.findOne({_id : req.user.userid}).populate('comment')
  user.comment.forEach(async (commentid)=>{
      console.log(commentid._id.toString(),'| ', comment._id.toString() )
    if(commentid._id.toString() === comment._id.toString()){
      await commentModel.findOneAndDelete({_id : req.params.id})
      await postModel.findOneAndUpdate({comment : req.params.id},{$pull : {comment : req.params.id}}) 
      await userModel.findOneAndUpdate({comment : req.params.id},{$pull : {comment : req.params.id}})     
    }
})
res.redirect(req.headers.referer || '/')
} catch (error) {
    console.log(error)
}
})

app.get('/profile',isLoggedIn,async (req, res) => {
    let user = await userModel.findOne({email : req.user.email}).populate('posts');
    res.render('profile',{user});
  })


app.get('/poststats/:id',isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({_id : req.params.id}).populate('userid').populate('likes').populate('comment')
  let user =  await userModel.findOne({_id : req.user.userid})
    res.render('poststats',{post,user})
})


app.get('/home',isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({email : req.user.email})
  let post = await postModel.find().populate('userid').populate('likes').populate('comment')
    res.render('home',{post,user})
  })



app.get('/logout', (req, res) => {
    res.cookie('loogedincookie',"");
    res.redirect('/')
  })
 
app.get('/support', (req, res) => {
    res.render('support')
  })
  

app.listen(3000, () => {
    console.log(`app is running `)
})