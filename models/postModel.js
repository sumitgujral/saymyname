const mongoose = require('mongoose');
const {Schema} = mongoose;

const postSchema = new Schema({
    caption : String,
    postdata : String,
    postCreated : String,
    userid : {
        type : Schema.Types.ObjectId,
        ref : 'user'
    },
    likes : [{
        type : Schema.Types.ObjectId,
        ref : 'user'
    }],
    comment : [{
        type : Schema.Types.ObjectId,
        ref : 'comment'
    }]
})

const postModel = mongoose.model('post',postSchema);

module.exports = postModel;