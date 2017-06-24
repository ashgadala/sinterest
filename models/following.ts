import * as mongoose from 'mongoose';

var followingSchema = new mongoose.Schema({
    userId: String,
    following_users: []
});

export = mongoose.model('following', followingSchema);