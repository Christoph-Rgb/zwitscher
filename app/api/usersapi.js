'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');
const Boom = require('boom');
const utils = require('./utils.js');

exports.authenticateUser = {
  auth: false,
  handler: function (request, reply) {
    const user = request.payload;
    User.findOne({ email: user.email }).then(foundUser => {
      if (foundUser && foundUser.password === user.password) {
        const token = utils.createToken(foundUser);
        reply({ success: true, token: token }).code(201);
      } else {
        reply({ success: false, message: 'Authentication failed. User not found.' }).code(201);
      }
    }).catch(err => {
      reply(Boom.notFound('internal db failure'));
    });
  },

};

exports.findAllUsers = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    let allUsers = [];
    let userCursor = User.find({}).cursor();
    userCursor.eachAsync((user) => {
      return Tweet.count({ user: user._id }).then(userTweetCount => {
        let leanUser = user.toObject();
        leanUser.tweetCount = userTweetCount;
        allUsers.push(leanUser);
      }).catch(err => { reply(Boom.badImplementation('error accessing db: ' + err)); });
    })
    .then(() => {
      reply(allUsers);
    }).catch(err => { reply(Boom.badImplementation('error accessing db: ' + err)); });
  },

};

exports.findOneUser = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    User.findOne({ _id: request.params.id }).lean().then(user => {
      if (user != null) {
        Tweet.count({ user: user._id }).then(userTweetCount => {
          user.tweetCount = userTweetCount;
          reply(user);
        }).catch(err => { reply(Boom.badImplementation('error accessing db: ' + err)); });
      } else {
        reply(Boom.notFound('id not found'));
      }
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.createUser = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const user = new User(request.payload);
    user.save().then(newUser => {
      let leanUser = newUser.toObject();
      leanUser.tweetCount = 0;
      reply(leanUser).code(201);
    }).catch(err => {
      reply(Boom.badImplementation('error creating User'));
    });
  },

};

exports.deleteAllUsers = {

  auth: {
    strategy: 'jwt',
    scope: 'admin',
  },

  handler: function (request, reply) {
    User.remove({ scope: 'user' }).then(err => {
      reply().code(204);
    }).catch(err => {
      reply(Boom.badImplementation('error removing Users'));
    });
  },

};

exports.deleteOneUser = {

  auth: {
    strategy: 'jwt',
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    const loggedInUserID = request.auth.credentials.id;
    const loggedInUserScope = request.auth.credentials.scope;
    const userToDeleteID = request.params.id;

    if (loggedInUserScope === 'admin' || loggedInUserID === userToDeleteID) {
      User.remove({ _id: request.params.id }).then(user => {
        reply(User).code(204);
      }).catch(err => {
        reply(Boom.notFound('id not found'));
      });
    } else {
      reply(Boom.forbidden('you do not have sufficient permissions'));
    }
  },

};

exports.deleteMultipleUsers = {

  auth: {
    strategy: 'jwt',
    scope: ['admin'],
  },

  handler: function (request, reply) {
    const usersToDelete = JSON.parse(request.params.usersToDelete);

    User.remove({ _id: { $in: usersToDelete } }).then((result, users) => {
      reply(result.result).code(204);
    }).catch(err => {
      reply(Boom.notFound('one or more IDs not found'));
    });
  },

};

exports.followUser = {

  auth: {
    strategy: 'jwt',
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    const loggedInUserID = request.auth.credentials.id;
    const userToFollowID = request.params.id;

    User.findOne({ _id: loggedInUserID }).then(loggedInUser => {
      loggedInUser.follows.push(userToFollowID);
      loggedInUser.save().then(user => {

        reply(user).code(201);

      }).catch(err => {
        reply(Boom.notFound('user not updated'));
      });
    }).catch(err => {
      reply(Boom.notFound('user not found'));
    });
  },
};

exports.unfollowUser = {

  auth: {
    strategy: 'jwt',
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    const loggedInUserID = request.auth.credentials.id;
    const userToUnfollowID = request.params.id;

    User.findOne({ _id: loggedInUserID }).then(loggedInUser => {

      const indexToRemove = loggedInUser.follows.indexOf(userToUnfollowID);
      if (indexToRemove !== -1) {
        loggedInUser.follows.splice(indexToRemove, 1);
        loggedInUser.save().then(user => {

          reply(user).code(201);

        }).catch(err => { reply(Boom.notFound('user not updated')); });
      }
    }).catch(err => { reply(Boom.notFound('user not found')); });
  },
};
