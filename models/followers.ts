import * as mongoose from 'mongoose';

var followerSchema = new mongoose.Schema({
    userId: String,
    followers: [String]
});

export = mongoose.model('follower', followerSchema);