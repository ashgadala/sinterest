import * as mongoose from 'mongoose';

var pinSchema = new mongoose.Schema({
    title: String,
    url: String,
    username: String,
    displayname: String
});

export = mongoose.model('pin', pinSchema);