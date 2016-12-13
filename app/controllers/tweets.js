'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');
const Joi = require('joi');
const GCloud = require('gcloud');

exports.showUserTimeline = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    showTimeline('userTimeline', request, reply);
  },
};

exports.postTweetUserTimeline = {

  auth: {
    scope: ['admin', 'user'],
  },

  payload: {
    maxBytes: 1000000,
  },

  validate: {
    payload: {
      tweetMessage: Joi.string().required(),
      tweetImage: Joi.optional(),
    },
    failAction: function (request, reply, source, error) {
      showTimelineWithErrors('userTimeline', request, reply, source, error);
    },
  },

  handler: function (request, reply) {
    postTweet('userTimeline', request, reply);
  },
};

exports.deleteTweetUserTimeline = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    deleteTweet('userTimeline', request, reply);
  },
};

exports.showGlobalTimeline = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    showTimeline('globalTimeline', request, reply);
  },
};

exports.postTweetGlobalTimeline = {

  auth: {
    scope: ['admin', 'user'],
  },

  payload: {
    maxBytes: 1000000,
  },

  validate: {
    payload: {
      tweetMessage: Joi.string().required(),
      tweetImage: Joi.optional(),
    },
    failAction: function (request, reply, source, error) {
      showTimelineWithErrors('globalTimeline', request, reply, source, error);
    },
  },

  handler: function (request, reply) {
    postTweet('globalTimeline', request, reply);
  },
};

exports.deleteTweetGlobalTimeline = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    deleteTweet('globalTimeline', request, reply);
  },
};

function showTimeline(timeline, request, reply) {
  const loggedInUserID = request.auth.credentials.loggedInUser;
  const loggedInUserScope = request.auth.credentials.scope;
  let viewedUserID;
  let tweetSearchOptions;
  if (timeline === 'userTimeline') {
    viewedUserID = request.params.id;
    tweetSearchOptions = { user: viewedUserID };
  } else if (timeline === 'globalTimeline') {
    viewedUserID = loggedInUserID;
    tweetSearchOptions = {};
  }

  getUser({ _id: loggedInUserID }).then(loggedInUser => {
    getUser({ _id: viewedUserID }).then(viewedUser => {
      getTweets(loggedInUserID, loggedInUserScope, tweetSearchOptions).then(tweets => {

        reply.view(timeline, {
          title: viewedUser.firstName + 's Timeline',
          user: viewedUser,
          loggedInUser: loggedInUser,
          canPost: loggedInUserID === viewedUserID,
          tweets: tweets,
        });

      }).catch(err => {console.log(err.message);});
    }).catch(err => {console.log(err.message);});
  }).catch(err => {console.log(err.message);});
}

function showTimelineWithErrors(timeline, request, reply, source, error) {
  const loggedInUserID = request.auth.credentials.loggedInUser;
  const loggedInUserScope = request.auth.credentials.scope;
  const tweetMessage = request.payload.tweetMessage;

  var tweetSearchOptions;
  if (timeline === 'userTimeline') {
    tweetSearchOptions = { user: loggedInUserID };
  } else if (timeline === 'globalTimeline') {
    tweetSearchOptions = {};
  }

  getUser({ _id: loggedInUserID }).then(loggedInUser => {
    getTweets(loggedInUserID, loggedInUserScope, tweetSearchOptions).then(tweets => {

      //only loggedInUser can post on userTimeline => viewedUser == loggedInUser
      reply.view(timeline, {
        title: loggedInUser.firstName + 's Timeline',
        user: loggedInUser,
        loggedInUser: loggedInUser,
        canPost: true,
        tweets: tweets,
        tweetMessage: tweetMessage,
        errors: error.data.details,
      }).code(400);

    }).catch(err => {console.log(err.message);});
  }).catch(err => {console.log(err.message);});
}

function postTweet(timeline, request, reply) {
  const loggedInUserID = request.auth.credentials.loggedInUser;
  const tweetMessage = request.payload.tweetMessage;
  const tweetImage = request.payload.tweetImage;

  var redirectPath;
  if (timeline === 'userTimeline') {
    redirectPath = '/' + timeline + '/' + loggedInUserID;
  } else if (timeline === 'globalTimeline') {
    redirectPath = '/' + timeline;
  }

  //create new tweet
  let tweet = new Tweet();
  tweet.user = loggedInUserID;
  tweet.message = tweetMessage;
  tweet.posted =  new Date();

  if (!tweetImage || !tweetImage.length) {
    //no image
    tweet.save().then(() => {
      reply.redirect(redirectPath);
    }).catch(err => { console.log(err.message); });
  } else {
    //image needs to be uploaded
    uploadImage(loggedInUserID, tweetImage).then(imageUrl => {
      tweet.imagePath = imageUrl;
      tweet.save().then(() => {
        reply.redirect(redirectPath);
      }).catch(err => { console.log(err.message); });
    }).catch(err => { console.log(err.message); });
  }
}

function deleteTweet(timeline, request, reply) {
  const loggedInUserID = request.auth.credentials.loggedInUser;
  const loggedInUserScope = request.auth.credentials.scope;
  const viewedUserID = request.payload.viewedUserID;
  const tweetID = request.payload.tweetID;

  var redirectPath;
  if (timeline === 'userTimeline') {
    redirectPath = '/' + timeline + '/' + loggedInUserID;
  } else if (timeline === 'globalTimeline') {
    redirectPath = '/' + timeline;
  }

  Tweet.findOne({ _id: tweetID })
      .then(tweet => {

        if (loggedInUserScope === 'admin' || tweet.user.equals(loggedInUserID)) {
          tweet.remove();
        } else {
          console.log(loggedInUserID + ' does not have permissions to delete ' + tweetID);
        }
      }).catch(err => { console.log(err.message); });

  reply.redirect(redirectPath);
}

function getUser(searchOptions) {
  return new Promise(function (resolve, reject) {
    User.findOne(searchOptions)
        .then(foundUser => {
          //add joinedString for displaying
          foundUser.joinedString = foundUser.joined.getFullYear();
          resolve(foundUser);
        })
        .catch(err => {
          reject(err);
        });
  });
}

function getTweets(loggedInUserID, loggedInUserScope, searchOptions) {
  return new Promise(function (resolve, reject) {
    Tweet.find(searchOptions).sort({ posted: -1 })
        .populate('user')
        .then(foundTweets => {

          //add postedString for displaying the date
          foundTweets.forEach(tweet => {
            tweet.postedString = tweet.posted.toLocaleString('en-GB');

            //check if user is allowed delete this tweet
            if (loggedInUserScope === 'admin' || tweet.user._id.equals(loggedInUserID)) {
              tweet.canDelete = true;
            }
          });

          resolve(foundTweets);
        }).catch(err => {
            reject(err);
          });
  });
}

function uploadImage(loggedInUserID, tweetImage) {
  return new Promise(function (resolve, reject) {
    //create firebase storage ref
    var storage = GCloud.storage({
      projectId: 'glowing-fire-9226',
      keyFilename: ('gcloudKeyFile.json'),
    });

    //create bucket ref
    var bucket = storage.bucket('glowing-fire-9226.appspot.com');

    //create ref to new file in bucket
    const fileName = loggedInUserID + '/' + new Date().getTime();
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
