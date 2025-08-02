const mongoose = require('mongoose');
const {Schema} = mongoose;

const otpverificationSchema = new Schema({
   email : String,
   verificationcodeGenerated : [],
   verificationcoderesetpassword : [],
    createdAt: Date,
    expireAt : Date,
})

const otpverificationModel = mongoose.model('otpverification',otpverificationSchema);

module.exports = otpverificationModel;