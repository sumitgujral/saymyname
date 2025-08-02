const mongoose = require('mongoose');
const {Schema} = mongoose;

const commentSchema = new Schema({
    commentPosted : String,
    commentDate : String,
    user : [{
        type : Schema.Types.ObjectId,
        ref : 'user'
    }] 
})

const commentModel = mongoose.model('comment',commentSchema);

module.exports = commentModel;