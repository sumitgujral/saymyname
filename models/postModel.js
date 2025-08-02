const mongoose = require('mongoose');
const {Schema} = mongoose;

const postSchema = new Schema({
    username : [{
        type : Schema.Types.ObjectId,
        ref : 'user'
    }],
    postimage : {
        data : Buffer,
        contentType : String
    },
    caption : String,
    postCreated : String,
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