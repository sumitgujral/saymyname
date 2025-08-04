const mongoose = require('mongoose');
const {Schema} = mongoose;

const likeSchema = new Schema({
    userid : {
        type : Schema.Types.ObjectId,
        ref : 'user'
    },
    post : {
        type : Schema.Types.ObjectId,
        ref : 'post'
    },
    likeDate : String
})

const likeModel = mongoose.model('like',likeSchema);

module.exports = likeModel;