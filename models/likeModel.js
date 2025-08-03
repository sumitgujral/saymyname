const mongoose = require('mongoose');
const {Schema} = mongoose;

const likeSchema = new Schema({
    userid : {
        type : Schema.Types.ObjectId,
        ref : 'user'
    },
    likeDate : {
       type : Date,
       default : new Date(Date.now())
    },
    post : {
        type : Schema.Types.ObjectId,
        ref : 'post'
    }
})

const likeModel = mongoose.model('like',likeSchema);

module.exports = likeModel;