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

      Tweet.find({user: user._id}).sort({ posted: -1})
          .populate('user')
          .then(tweets => {

            tweets.forEach(tweet => {
              tweet.postedString = tweet.posted.toLocaleString('en-GB');
              if(user.scope === 'admin' || tweet.user._id.equals(user._id)){
                tweet.canDelete = true;
              }
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

exports.postTweet = {

  auth: {
    scope: ['admin', 'user'],
  },

  validate: {
    payload: {
      message: Joi.string().required(),
    },
    failAction: function (request, reply, source, error) {
      const userID = request.auth.credentials.loggedInUser;
      const message = request.payload.message;

      User.findOne({ _id: userID })
          .then(user => {

            user.joinedString = user.joined.getFullYear();

            Tweet.find({user: user._id}).sort({ posted: -1})
                .populate('user')
                .then(tweets => {

                  tweets.forEach(tweet => {
                    tweet.postedString = tweet.posted.toLocaleString('en-GB');
                    if(user.scope === 'admin' || tweet.user._id.equals(user._id)){
                      tweet.canDelete = true;
                    }
                  })

                  reply.view('home', {
                    title: 'Welcome to Zwitscher',
                    user: user,
                    tweets: tweets,
                    message: message,
                    errors: error.data.details,
                  }).code(400);
                })
                .catch(err => {});
          })
          .catch(err => {
          });

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

    reply.redirect('/home');

  },

};

exports.deleteTweet = {

  auth: {
    scope: ['admin', 'user'],
  },

  // validate: {
  //   payload: {
  //     tweetID: Joi.string().required(),
  //   },
  //   failAction: function (request, reply, source, error) {
  //     const userID = request.auth.credentials.loggedInUser;
  //     const tweetID = request.payload.tweetID;
  //
  //     User.findOne({ _id: userID })
  //         .then(user => {
  //
  //           user.joinedString = user.joined.getFullYear();
  //
  //           Tweet.find({user: user._id}).sort({ posted: -1})
  //               .populate('user')
  //               .then(tweets => {
  //
  //                 tweets.forEach(tweet => {
  //                   tweet.postedString = tweet.posted.toLocaleString('en-GB');
  //                   if(user.scope === 'admin' || tweet.user._id.equals(user._id)){
  //                     tweet.canDelete = true;
  //                   }
  //                 })
  //
  //                 reply.view('home', {
  //                   title: 'Welcome to Zwitscher',
  //                   user: user,
  //                   tweets: tweets,
  //                   message: message,
  //                   errors: error.data.details,
  //                 }).code(400);
  //               })
  //               .catch(err => {});
  //         })
  //         .catch(err => {
  //         });
  //
  //   },
  // },

  handler: function (request, reply) {
    const userID = request.auth.credentials.loggedInUser;
    const userScope = request.auth.credentials.scope;
    const tweetID = request.payload.tweetID;

    Tweet.findOne({ _id: tweetID })
        .then(tweet => {

          if (userScope === 'admin' || tweet.user.equals(userID)){
            tweet.remove();
          }
        })
        .catch(err => {});

    reply.redirect('/home');

  },

};
