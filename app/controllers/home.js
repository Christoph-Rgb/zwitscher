'use strict';

const User = require('../models/user');
const Joi = require('joi');

exports.home = {
  handler: function (request, reply) {
    reply.view('home', { title: 'Welcome to Donations' });
  },

};
