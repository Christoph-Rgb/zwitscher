'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');
const Joi = require('joi');
const GCloud = require('gcloud');

exports.globalTimeline = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    const loggedInUserID = request.auth.credentials.loggedInUser;
    const loggedInUserScope = request.auth.credentials.scope;

    User.findOne({ _id: loggedInUserID }).then(loggedInUser => {

      loggedInUser.joinedString = loggedInUser.joined.getFullYear();

      Tweet.find({ }).sort({ posted: -1 })
          .populate('user')
          .then(tweets => {

            tweets.forEach(tweet => {
              tweet.postedString = tweet.posted.toLocaleString('en-GB');
              if (loggedInUserScope === 'admin' || tweet.user._id.equals(loggedInUserID)) {
                tweet.canDelete = true;
              }

              tweet.timeLine = 'globalTimeline';
            });

            reply.view('globalTimeline', {
              title: 'Global Timeline',
              user: loggedInUser,
              loggedInUser: loggedInUser,
              canPost: true,
              tweets: tweets,
              timeLine: 'globalTimeline',
            });
          })
      .catch(err => {});
    })
    .catch(err => {});
  },

};

exports.postTweet = {

  auth: {
    scope: ['admin', 'user'],
  },

  payload: {
    maxBytes: 1000000,
  },

  validate: {
    payload: {
      message: Joi.string().required(),
      image: Joi.optional(),
    },
    failAction: function (request, reply, source, error) {
      const loggedInUserID = request.auth.credentials.loggedInUser;
      const loggedInUserScope = request.auth.credentials.scope;
      const message = request.payload.message;

      //only loggedInUser can post so viewed user equals loggedInUser
      User.findOne({ _id: loggedInUserID })
          .then(user => {

              user.joinedString = user.joined.getFullYear();

              Tweet.find().sort({ posted: -1 })
                  .populate('user')
                  .then(tweets => {

                    tweets.forEach(tweet => {
                      tweet.postedString = tweet.posted.toLocaleString('en-GB');
                      if (loggedInUserScope === 'admin' || tweet.user._id.equals(loggedInUserID)) {
                        tweet.canDelete = true;
                      }

                      tweet.timeLine = 'globalTimeline';
                    });

                    reply.view('globalTimeline', {
                      title: 'Global Timeline',
                      user: user,
                      loggedInUser: user,
                      canPost: true,
                      tweets: tweets,
                      message: message,
                      errors: error.data.details,
                      timeLine: 'globalTimeline',
                    }).code(400);
                  })
                  .catch(err => {});
            })
          .catch(err => {});

    },
  },

  handler: function (request, reply) {
    const loggedInUserID = request.auth.credentials.loggedInUser;
    const message = request.payload.message;
    const image = request.payload.image;

    let tweet = new Tweet();
    tweet.user = loggedInUserID;
    tweet.message = message;
    tweet.posted =  new Date();

    if (image.length) {
      var storage = GCloud.storage({
        projectId: 'glowing-fire-9226',
        keyFilename: ('gcloudKeyFile.json'),
      });
      var bucket = storage.bucket('glowing-fire-9226.appspot.com');

      const fileName = loggedInUserID + '/' + new Date().getTime();
      const newFile = bucket.file(fileName);

      uploadFile(newFile, image, function (err) {
        if (!err) {

          bucket.file(fileName).getSignedUrl({
            action: 'read',
            expires: '08-12-2025',
          }, function (err, url) {
            if (!err) {

              tweet.imagePath = url;
              tweet.save();

              reply.redirect('/globalTimeline');

            } else {
              //TODO: redirect to error page
              console.error(err);
            }
          });
        } else {
          //TODO: redirect to error page
          console.error(err);
        }
      });
    } else {
      tweet.save();
      reply.redirect('/globalTimeline');
    }
  },

};

exports.deleteTweet = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    const loggedInUserID = request.auth.credentials.loggedInUser;
    const loggedInUserScope = request.auth.credentials.scope;
    const tweetID = request.payload.tweetID;

    Tweet.findOne({ _id: tweetID })
        .then(tweet => {

          if (loggedInUserScope === 'admin' || tweet.user.equals(loggedInUserID)) {
            tweet.remove();
          }
        })
        .catch(err => {});

    reply.redirect('/globalTimeline');

  },

};

function uploadFile(file, contents, callback) {
  // open write stream
  var stream = file.createWriteStream({
    metadata: {
      contentType: 'image/jpeg',
    },
  });

  // if there is an error signal back
  stream.on('error', callback);

  // if everything is successfull signal back
  stream.on('finish', callback);

  // send the contents
  stream.end(contents);
}
