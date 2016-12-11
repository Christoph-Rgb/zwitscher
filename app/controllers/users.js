'use strict';

const User = require('../models/user');
const Joi = require('joi');

exports.users = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    const loggedInUserID = request.auth.credentials.loggedInUser;

    User.findOne({ _id: loggedInUserID }).then(loggedInUser => {

      User.find({}).then(allUsers => {

              allUsers.forEach(user => {
                user.joinedString = user.joined.getFullYear();
                if (loggedInUser.scope === 'admin' && !user._id.equals(loggedInUser._id)){
                  user.deletable = true;
                }
              });

              reply.view('users', {
                title: 'Zwitscher home',
                users: allUsers,
                loggedInUser: loggedInUser,
                isAdmin: loggedInUser.scope === 'admin',
              });

            })
            .catch(err => {});
    })
    .catch(err => {});
  },

};
