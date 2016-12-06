'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');
const Boom = require('boom');
const utils = require('./utils.js');

exports.findAllTweets = {

  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },

  handler: function (request, reply) {
    Tweet.find({}).exec().then(tweets => {
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
    Tweet.findOne({ _id: request.params.id }).then(tweet => {
      if (tweet != null) {
        reply(tweet);
      }

      reply(Boom.notFound('id not found'));
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
    Tweet.find({ user: request.params.id }).then(tweets => {
      if (tweets != null) {
        reply(tweets);
      } else{
        reply(Boom.notFound('id not found'));
      }
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.postTweet = {

  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },

  handler: function (request, reply) {
    let tweet = new Tweet(request.payload);
    tweet.user = request.auth.credentials.id;
    tweet.posted = new Date();

    tweet.save().then(tweet => {
      reply(tweet).code(201);
    }).catch(err => {
      reply(Boom.badImplementation('error creating Tweet'));
    });
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
