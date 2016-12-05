'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let devDbUri = 'mongodb://localhost/zwitscher';
let prodDbUri = 'mongodb://mlabchris:mlabchris@ds163667.mlab.com:63667/zwitscher';
let dbURI = '';

mongoose.connection.on('connected', function () {
  if (process.env.ENV == 'DEV') {
    var seeder = require('mongoose-seeder');
    const data = require('./data.json');
    const User = require('./user');
    const Tweet = require('./tweet');

    seeder.seed(data, { dropDatabase: false, dropCollections: true }).then(dbData => {
      console.log('preloading Test Data');
      console.log(dbData);
    }).catch(err => {
      console.log(error);
    });
  }

});

if (process.env.ENV == 'DEV') {
  dbURI = devDbUri;
} else {//default PROD for HEROKU deployment
  dbURI = prodDbUri;
}

mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});
