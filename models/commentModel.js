const mongoose = require('mongoose');
const {Schema} = mongoose;
const autopopulate = require('mongoose-autopopulate');

const commentSchema = new Schema({
    userid : {
        type : Schema.Types.ObjectId,
        ref : 'user',
        autopopulate: true
    },
    comment : String,
    post : {
        type : Schema.Types.ObjectId,
        ref : 'post'
    },
    commentCreated : String,

})
commentSchema.plugin(autopopulate);
const commentModel = mongoose.model('comment',commentSchema);

module.exports = commentModel;