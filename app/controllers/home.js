'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');
const Joi = require('joi');

exports.home = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    const userID = request.auth.credentials.loggedInUser;

    User.findOne({ _id: userID })
        .then(user => {

          user.joinedString = user.joined.getFullYear();

      Tweet.find({user: user._id})
          .populate('user')
          .then(tweets => {

            tweets.forEach(tweet => {
              tweet.postedString = tweet.posted.toLocaleString('en-GB');
            })

          reply.view('home', {
            title: 'Welcome to Zwitscher',
            user: user,
            tweets: tweets,
          });
        })
        .catch(err => {});
      })
      .catch(err => {
      });
  },

};
