'use strict';

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  profilePicture: String,
  gender: String,
  joined: Date,
  follows: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  scope: String,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
