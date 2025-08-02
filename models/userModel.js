const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    email : String,
    name : String,
    username : String,
    password : String,
    verificationcode : String,
    verified : Boolean,
    profileimage : {
        data : Buffer,
        contentType : String
    },
    accountCreated : String,
    dob : String,
    gender : String,
    phoneNumber : Number,
    pincode : Number,
    address : String,
    maritalStatus : String,
    posts : [{
        type : Schema.Types.ObjectId,
        ref : 'post'
    }],
    stories : [{
        type : Schema.Types.ObjectId,
        ref : 'story'
    }], 
    comment : [{
        type : Schema.Types.ObjectId,
        ref : 'comment'
    }],
    verificationcodeUsed : { type : Schema.Types.ObjectId,
        ref : 'otpverification'
    }
})

const userModel = mongoose.model('user',userSchema);

module.exports = userModel;