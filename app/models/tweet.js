'use strict';

const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  user:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  message: String,
  image: String,
  posted: Date,
});

const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;
