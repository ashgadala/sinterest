import * as mongoose from 'mongoose';

var likeSchema = new mongoose.Schema({
    userId: String,
    liked: [String]
});

export = mongoose.model('likes', likeSchema);