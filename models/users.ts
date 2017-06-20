import * as mongoose from 'mongoose';

var userSchema = new mongoose.Schema({
    twitterID: String,
    token: String,
    username: String,
    displayname: String
});

export =  mongoose.model('user', userSchema) 