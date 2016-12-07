'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');
const Joi = require('joi');

exports.userTimeline = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    const loggedInUserID = request.auth.credentials.loggedInUser;
    const loggedInUserScope = request.auth.credentials.scope;
    const viewedUserID = request.params.id;

    User.findOne({ _id: viewedUserID })
        .then(user => {

          user.joinedString = user.joined.getFullYear();

          User.find({}).then(allUsers => {

            Tweet.find({ user: user._id }).sort({ posted: -1 })
                .populate('user')
                .then(tweets => {

                  tweets.forEach(tweet => {
                    tweet.postedString = tweet.posted.toLocaleString('en-GB');
                    if (loggedInUserScope === 'admin' || tweet.user._id.equals(loggedInUserID)) {
                      tweet.canDelete = true;
                    }
                  });

                  reply.view('userTimeline', {
                    title: user.firstName + 's Timeline',
                    user: user,
                    loggedInUserID: loggedInUserID,
                    canPost: loggedInUserID === viewedUserID,
                    tweets: tweets,
                    allUsers: allUsers,
                  });
                })
                .catch(err => {});
          })
          .catch(err => {});
        })
      .catch(err => {
      });
  },

};

exports.postTweet = {

  auth: {
    scope: ['admin', 'user'],
  },

  validate: {
    payload: {
      message: Joi.string().required(),
    },
    failAction: function (request, reply, source, error) {
      const loggedInUserID = request.auth.credentials.loggedInUser;
      const loggedInUserScope = request.auth.credentials.scope;
      const message = request.payload.message;

      User.findOne({ _id: loggedInUserID })
          .then(user => {

            user.joinedString = user.joined.getFullYear();

            User.find({}).then(allUsers => {

              Tweet.find({ user: user._id }).sort({ posted: -1 })
                  .populate('user')
                  .then(tweets => {

                    tweets.forEach(tweet => {
                      tweet.postedString = tweet.posted.toLocaleString('en-GB');
                      if (loggedInUserScope === 'admin' || tweet.user._id.equals(loggedInUserID)) {
                        tweet.canDelete = true;
                      }
                    });

                    reply.view('userTimeline', {
                      title:  user.firstName + 's Timeline',
                      user: user,
                      loggedInUserID: loggedInUserID,
                      canPost: true,
                      tweets: tweets,
                      message: message,
                      errors: error.data.details,
                    }).code(400);
                  })
                  .catch(err => {});
            })
            .catch(err => {});

          })
          .catch(err => {});

    },
  },

  handler: function (request, reply) {
    const userID = request.auth.credentials.loggedInUser;
    const message = request.payload.message;

    let tweet = new Tweet();
    tweet.user = userID;
    tweet.message = message;
    tweet.posted =  new Date();

    tweet.save();

    reply.redirect('/userTimeline/' + userID);

  },

};

exports.deleteTweet = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    const loggedInUserID = request.auth.credentials.loggedInUser;
    const loggedInUserScope = request.auth.credentials.scope;
    const viewedUserID = request.payload.viewedUserID;
    const tweetID = request.payload.tweetID;

    Tweet.findOne({ _id: tweetID })
        .then(tweet => {

          if (loggedInUserScope === 'admin' || tweet.user.equals(loggedInUserID)) {
            tweet.remove();
          }
        })
        .catch(err => {});

    reply.redirect('/userTimeline/' + viewedUserID);

  },

};
