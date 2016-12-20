'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');
const Joi = require('joi');

exports.users = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    const loggedInUserID = request.auth.credentials.loggedInUser;

    User.findOne({ _id: loggedInUserID }).then(loggedInUser => {

      Tweet.count({ user: loggedInUserID }).then(loggedInUserTweetCount => {
        loggedInUser.tweetCount = loggedInUserTweetCount;

        let allUsers = [];
        const userCursor = User.find({}).cursor();
        userCursor.eachAsync(user => {
            user.joinedString = user.joined.getFullYear();
            if (loggedInUser.scope === 'admin' && !user._id.equals(loggedInUser._id)) {
              user.canDelete = true;
            }

            return Tweet.count({ user: user._id }).then(userTweetCount => {
              user.tweetCount = userTweetCount;
              allUsers.push(user);
            }).catch(err => { console.log(err); });
          })
        .then(() => {
            reply.view('users', {
              title: 'Zwitscher home',
              users: allUsers,
              loggedInUser: loggedInUser,
              isAdmin: loggedInUser.scope === 'admin',
            });
          }).catch(err => { console.log(err); });
      }).catch(err => { console.log(err); });
    }).catch(err => { console.log(err); });
  },

};
