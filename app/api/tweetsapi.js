'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');
const Boom = require('boom');
const utils = require('./utils.js');
const GCloud = require('gcloud');

exports.findAllTweets = {

  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },

  handler: function (request, reply) {
    Tweet.find({}).populate('user').then(tweets => {
      reply(tweets);
    }).catch(err => {
      reply(Boom.badImplementation('error accessing db'));
    });
  },

};

exports.findOneTweet = {

  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },

  handler: function (request, reply) {
    Tweet.findOne({ _id: request.params.id }).populate('user').then(tweet => {
      if (tweet != null) {
        reply(tweet);
      }

      reply(Boom.notFound('id not found'));
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.findAllTweetsByUser = {

  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },

  handler: function (request, reply) {
    Tweet.find({ user: request.params.id }).populate('user').then(tweets => {
      if (tweets != null) {
        reply(tweets);
      } else {
        reply(Boom.notFound('id not found'));
      }
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.findAllTweetsForUser = {

  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },

  handler: function (request, reply) {

    User.findOne({ _id: request.params.id }).then(user => {
      Tweet.find({ $or: [{ user: user._id }, { user: { $in: user.follows } }] }).populate('user').then(tweets => {
        if (tweets != null) {
          reply(tweets);
        } else {
          reply(Boom.notFound('tweets not found'));
        }
      }).catch(err => {
        reply(Boom.notFound('tweets not found'));
      });
    }).catch(err => {
      reply.Boom.notFound('user not found');
    });
  },

};

exports.postTweet = {

  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },

  payload: {
    maxBytes: 10000000,
  },

  handler: function (request, reply) {
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    const userID = request.auth.credentials.id;
    let tweet = new Tweet(request.payload);
    tweet.user = userID;
    tweet.posted = new Date();

    // if (request.payload.image && request.payload.image.data.length) {
    if (request.payload.image) {
      // const image = new Uint8Array(request.payload.image.data);

      if (base64regex.test(request.payload.image)) {
        const image = new Buffer(request.payload.image, 'base64');

        var storage = GCloud.storage({
          projectId: 'glowing-fire-9226',
          keyFilename: ('gcloudKeyFile.json'),
        });
        var bucket = storage.bucket('glowing-fire-9226.appspot.com');

        const fileName = userID + '/' + new Date().getTime();
        const newFile = bucket.file(fileName);

        uploadFile(newFile, image, function (err) {
          if (!err) {

            bucket.file(fileName).getSignedUrl({
              action: 'read',
              expires: '08-12-2025',
            }, function (err, url) {
              if (!err) {

                tweet.imagePath = url;

                tweet.save().then(tweet => {
                  reply(tweet).code(201);
                }).catch(err => {
                  reply(Boom.badImplementation('error creating Tweet'));
                });

              } else {
                //TODO: redirect to error page
                console.error(err);
                reply(Boom.badImplementation('error creating Tweet'));
              }
            });
          } else {
            reply(Boom.badImplementation('error creating Tweet'));
          }
        });
      } else {
        reply(Boom.badData('image needs to be base64 encoded string'));
      }
    } else {
      tweet.save().then(tweet => {
        reply(tweet).code(201);
      }).catch(err => {
        reply(Boom.badImplementation('error creating Tweet'));
      });
    }
  },

};

exports.deleteAllTweets = {

  auth: {
    strategy: 'jwt',
    scope: 'admin',
  },

  handler: function (request, reply) {
    Tweet.remove({}).then(err => {
      reply().code(204);
    }).catch(err => {
      reply(Boom.badImplementation('error removing Tweet'));
    });
  },

};

exports.deleteOneTweet = {

  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },

  handler: function (request, reply) {
    Tweet.remove({ _id: request.params.id }).then(tweet => {
      reply(tweet).code(204);
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.deleteMultipleTweets = {

  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },

  handler: function (request, reply) {
    const tweetsToDelete = JSON.parse(request.params.tweetsToDelete);

    Tweet.remove({ _id: { $in: tweetsToDelete } }).then((result, tweets) => {
      reply(result.result).code(204);
    }).catch(err => {
      reply(Boom.notFound('one or more IDs not found'));
    });
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
