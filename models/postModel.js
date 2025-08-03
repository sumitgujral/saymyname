const mongoose = require('mongoose');
const {Schema} = mongoose;

const postSchema = new Schema({
    userid : {
        type : Schema.Types.ObjectId,
        ref : 'user'
    },
    postdata : String,
    caption : String,
    postCreated : String,
    likes : [{
        type : Schema.Types.ObjectId,
        ref : 'like'
    }],
    comment : [{
        type : Schema.Types.ObjectId,
        ref : 'comment'
    }]
})

const postModel = mongoose.model('post',postSchema);

module.exports = postModel;