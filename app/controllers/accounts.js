'use strict';

const User = require('../models/user');
const Joi = require('joi');
const GCloud = require('gcloud');

exports.main = {
  auth: false,
  handler: function (request, reply) {
    reply.view('main', { title: 'Welcome to Zwitscher' });
  },

};

exports.signup = {
  auth: false,
  handler: function (request, reply) {
    reply.view('signup', { title: 'Sign up for Zwitscher' });
  },

};

exports.login = {
  auth: false,
  handler: function (request, reply) {
    reply.view('login', { title: 'Login to Zwitscher' });
  },

};

exports.authenticate = {
  auth: false,

  validate: {

    payload: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      const user = request.payload;

      reply.view('login', {
        title: 'Login error',
        user: user,
        errors: error.data.details,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },

  },

  handler: function (request, reply) {
    const user = request.payload;
    User.findOne({ email: user.email }).then(foundUser => {
      if (foundUser && foundUser.password === user.password) {
        request.cookieAuth.set({
          loggedIn: true,
          loggedInUser: foundUser._id,
          scope: foundUser.scope,
        });

        // reply.redirect('/userTimeline/' + foundUser._id);
        reply.redirect('/home');
      } else {
        // reply.redirect('/signup');
        reply.view('login', {
          title: 'Login error',
          user: user,
          errors: [{ message: 'email or password incorrect' }],
        }).code(400);
      }
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.logout = {
  auth: false,
  handler: function (request, reply) {
    request.cookieAuth.clear();
    reply.redirect('/');
  },

};

exports.register = {
  auth: false,

  validate: {

    payload: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      gender: Joi.string().required(),
      profileImage: Joi.optional(),

      //TODO: change to min 6
      password: Joi.string().min(1).max(15).required(),
      passwordConfirm: Joi.any().valid(Joi.ref('password')).required()
                          .options({ language: { any: { allowOnly: 'must match password' } } }),
    },

    failAction: function (request, reply, source, error) {

      const user = request.payload;

      reply.view('signup', {
        title: 'Sign up error',
        user: user,
        errors: error.data.details,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },

  },

  handler: function (request, reply) {
    const profileImage = request.payload.profileImage;
    const user = new User(request.payload);
    user.scope = 'user';
    user.joined = new Date();
    if (user.gender === 'M') {
      user.profilePicture = '/images/profilePictures/male1.jpg';
    } else {
      user.profilePicture = '/images/profilePictures/female1.jpg';
    }

    user.save().then(newUser => {
      if (profileImage && profileImage.length) {
        //image needs to be uploaded
        uploadImage(newUser._id, profileImage).then(imageUrl => {
          newUser.profilePicture = imageUrl;
          newUser.save().then(() => {
            reply.redirect('/login');
          }).catch(err => { reply.redirect('/'); });
        }).catch(err => { reply.redirect('/'); });
      } else {
        reply.redirect('/login');
      }
    }).catch(err => {
      reply.redirect('/');
    });
  },
};

exports.removeUser = {
  validate: {

    payload: {
      viewedUserID: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {

      reply.redirect('/users');

    },

    options: {
      abortEarly: false,
    },

  },

  handler: function (request, reply) {
    const viewedUserID = request.payload.viewedUserID;
    const loggedInUserID = request.auth.credentials.loggedInUser;
    const loggedInUserScope = request.auth.credentials.scope;

    //TODO: delete all tweets?

    User.findOne({ _id: viewedUserID })
        .then(user => {

          if (loggedInUserScope === 'admin' || user._id.equals(loggedInUserID)) {
            user.remove();
          }
        })
        .catch(err => {});
    reply.redirect('/users');

  },

};

exports.removeMultipleUsers = {

  auth: {
    scope: ['admin'],
  },

  validate: {

    payload: {
      itemsToDelete: Joi.array().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.redirect('/users');
    },

    options: {
      abortEarly: false,
    },

  },

  handler: function (request, reply) {
    const usersToDelete = request.payload.itemsToDelete;

    //TODO: delete all tweets?

    User.find({ _id: { $in: usersToDelete } })
        .then(users => {
          users.forEach(user => {
              user.remove();
            });
        })
        .catch(err => { console.log(err.message); });

    reply.redirect('/users');

  },

};

function uploadImage(userID, tweetImage) {
  return new Promise(function (resolve, reject) {
    //create firebase storage ref
    var storage = GCloud.storage({
      projectId: 'glowing-fire-9226',
      keyFilename: ('gcloudKeyFile.json'),
    });

    //create bucket ref
    var bucket = storage.bucket('glowing-fire-9226.appspot.com');

    //create ref to new file in bucket
    const fileName = userID + '/' + new Date().getTime();
    const newFile = bucket.file(fileName);

    uploadFileToFirebase(newFile, 'image/jpeg', tweetImage, function (err) {
      if (!err) {
        //return the url of the created file
        bucket.file(fileName).getSignedUrl({
          action: 'read',
          expires: '08-12-2025',
        }, function (err, url) {
          if (!err) {
            resolve(url);
          } else {
            reject(err);
          }
        });
      } else {
        reject(err);
      }
    });
  });
}

function uploadFileToFirebase(file, contentType, contents, callback) {
  // open write stream
  var stream = file.createWriteStream({
    metadata: {
      contentType: contentType,
    },
  });

  // if there is an error signal back
  stream.on('error', callback);

  // if everything is successfull signal back
  stream.on('finish', callback);

  // send the contents
  stream.end(contents);
}

// exports.viewSettings = {
//
//   handler: function (request, reply) {
//     var userEmail = request.auth.credentials.loggedInUser;
//     User.findOne({ email: userEmail }).then(foundUser => {
//       reply.view('settings', { title: 'Edit Account Settings', user: foundUser });
//     }).catch(err => {
//       reply.redirect('/');
//     });
//   },
//
// };
//
// exports.updateSettings = {
//
//   validate: {
//
//     payload: {
//       firstName: Joi.string().required(),
//       lastName: Joi.string().required(),
//       email: Joi.string().email().required(),
//
//       //TODO: change to min 6
//       password: Joi.string().min(1).max(15).required(),
//       passwordConfirm: Joi.any().valid(Joi.ref('password'))
// .required().options({ language: { any: { allowOnly: 'must match password' } } }),
//     },
//
//     failAction: function (request, reply, source, error) {
//       reply.view('settings', {
//         title: 'Update settings error',
//         errors: error.data.details,
//         user: request.payload,
//       }).code(400);
//     },
//
//     options: {
//       abortEarly: false,
//     },
//
//   },
//
//   handler: function (request, reply) {
//     const editedUser = request.payload;
//     const loggedInUserEmail = request.auth.credentials.loggedInUser;
//
//     User.findOne({ email: loggedInUserEmail }).then(user => {
//       user.firstName = editedUser.firstName;
//       user.lastName = editedUser.lastName;
//       user.email = editedUser.email;
//       user.password = editedUser.password;
//       return user.save();
//     }).then(user => {
//       reply.view('settings', { title: 'Edit Account Settings', user: user });
//     }).catch(err => {
//       reply.redirect('/');
//     });
//   },
//
// };
