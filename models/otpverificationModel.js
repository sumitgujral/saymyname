const mongoose = require('mongoose');
const {Schema} = mongoose;

const otpverificationSchema = new Schema({
   email : String,
   verificationcodeGenerated : [],
   verificationcoderesetpassword : [],
    createdAt: String,
    expireAt : String,
})

const otpverificationModel = mongoose.model('otpverification',otpverificationSchema);

module.exports = otpverificationModel;