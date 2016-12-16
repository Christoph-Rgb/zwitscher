'use strict';

const User = require('../models/user');
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
    User.find({}).exec().then(users => {
      reply(users);
    }).catch(err => {
      reply(Boom.badImplementation('error accessing db'));
    });
  },

};

exports.findOneUser = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    User.findOne({ _id: request.params.id }).then(user => {
      if (user != null) {
        reply(user);
      }

      reply(Boom.notFound('id not found'));
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
      reply(newUser).code(201);
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
