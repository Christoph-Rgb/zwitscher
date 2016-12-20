'use strict';

//TODO: fix titles

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

exports.deleteMultipleTweetsGlobalTimeline = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    deleteMultipleTweets('globalTimeline', request, reply);
  },
};

exports.deleteMultipleTweetsUserTimeline = {

  auth: {
    scope: ['admin', 'user'],
  },

  handler: function (request, reply) {
    deleteMultipleTweets('userTimeline', request, reply);
  },
};

function showTimeline(timeline, request, reply) {
  const loggedInUserID = request.auth.credentials.loggedInUser;
  const loggedInUserScope = request.auth.credentials.scope;
  let viewedUserID;
  let tweetSearchOptions;
  let title;
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

        //TODO: sketchy
        //check if loggedInUser is following viewedUser
        var indexOfFollowing = loggedInUser.follows.findIndex(followedUserID => {
          return viewedUser._id.equals(followedUserID);
        });
        if (indexOfFollowing !== -1) {
          viewedUser.isFollowing = true;
        }

        //TODO: sketchy
        //check if loggedInUser is current user
        viewedUser.canFollow = !loggedInUser._id.equals(viewedUser._id);

        reply.view(timeline, {
          title: 'Welcome to Zwitscher',
          user: viewedUser,
          loggedInUser: loggedInUser,
          canPost: loggedInUserID === viewedUserID,
          showUserButtons: (loggedInUserID === viewedUserID || loggedInUser.scope === 'admin'),
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
        title: 'Error posting tweet',
        user: loggedInUser,
        loggedInUser: loggedInUser,
        canPost: true,
        showUserButtons: true,
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

function deleteMultipleTweets(timeline, request, reply) {
  const loggedInUserID = request.auth.credentials.loggedInUser;
  const loggedInUserScope = request.auth.credentials.scope;
  const tweetsToDelete = JSON.parse(request.payload.itemsToDelete);

  var redirectPath;
  if (timeline === 'userTimeline') {
    redirectPath = '/' + timeline + '/' + loggedInUserID;
  } else if (timeline === 'globalTimeline') {
    redirectPath = '/' + timeline;
  }

  Tweet.find({ _id: { $in: tweetsToDelete } })
      .then(tweets => {

        tweets.forEach(tweet => {
          if (loggedInUserScope === 'admin' || tweet.user.equals(loggedInUserID)) {
            tweet.remove();
          } else {
            console.log(loggedInUserID + ' does not have permissions to delete tweet ' + tweet._id);
          }
        });
      }).catch(err => { console.log(err.message); });

  reply.redirect(redirectPath);
}

function getUser(searchOptions) {
  return new Promise(function (resolve, reject) {

    User.findOne(searchOptions)
        .then(foundUser => {
          //add joinedString for displaying
          foundUser.joinedString = foundUser.joined.getFullYear();

          //add tweet count
          Tweet.count({ user: foundUser._id }).then(userTweetCount => {
            foundUser.tweetCount = userTweetCount;

            resolve(foundUser);
          }).catch(err => {
            reject(err);
          });
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
