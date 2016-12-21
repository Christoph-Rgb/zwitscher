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

            //check if loggedInUser is following current user
            var indexOfFollowing = loggedInUser.follows.findIndex(followedUserID => {
              return user._id.equals(followedUserID);
            });
            if (indexOfFollowing !== -1) {
              user.isFollowing = true;
            }

            //check if loggedInUser is current user
            user.canFollow = !loggedInUser._id.equals(user._id);

            Tweet.count({ user: user._id }).then(userTweetCount => {
              user.tweetCount = userTweetCount;

              //add follower count
              return User.count({ follows: user._id }).then(followerCount => {
                user.followerCount = followerCount;
                allUsers.push(user);

              }).catch(err => { console.log(err); });
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

exports.followUser = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    const loggedInUserID = request.auth.credentials.loggedInUser;
    const userToFollowID = request.payload.userToFollowID;

    User.findOne({ _id: loggedInUserID }).then(loggedInUser => {
      loggedInUser.follows.push(userToFollowID);
      loggedInUser.save().then(() => {

        //not redirecting because java script
        // reply.response({ redirect: '/userTimeline/' + userToFollowID });
        reply.response({ success: true });

        // reply.redirect('/userTimeline/' + userToFollowID);

      }).catch(err => { console.log(err); });
    }).catch(err => { console.log(err); });

  },
};

exports.unfollowUser = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    const loggedInUserID = request.auth.credentials.loggedInUser;
    const userToUnfollowID = request.payload.userToUnfollowID;

    User.findOne({ _id: loggedInUserID }).then(loggedInUser => {

      const indexToRemove = loggedInUser.follows.indexOf(userToUnfollowID);
      if (indexToRemove !== -1) {
        loggedInUser.follows.splice(indexToRemove, 1);
        loggedInUser.save().then(() => {

          reply.response({ success: true });

        }).catch(err => {
          console.log(err);
        });
      }
    }).catch(err => { console.log(err); });

  },
};
