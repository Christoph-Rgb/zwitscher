'use strict';

const assert = require('chai').assert;
const ZwitscherService = require('./zwitscher-service');
const fixtures = require('./fixtures.json');
const _ = require('lodash');
const fs = require('fs');

suite('Tweet API tests', function () {

  //TODO: find out why beforeEach is run several times in one test configuration

  let adminUser = fixtures.users[0];
  let user = fixtures.users[1];
  let users = fixtures.users;
  let tweets = fixtures.tweets;
  let newTweet = fixtures.newTweet;
  let zwitscherService = new ZwitscherService(fixtures.zwitscherService);

  beforeEach(function () {
    zwitscherService.login(adminUser);
    zwitscherService.deleteAllUsers();
    zwitscherService.deleteAllTweets();

    for (let i = 1; i < users.length; i++) {
      zwitscherService.createUser(users[i]);
    }

    zwitscherService.logout();
    zwitscherService.login(user);

    tweets.forEach(tweet => {
      zwitscherService.postTweet(tweet);
    });
  });

  afterEach(function () {
    zwitscherService.logout();
    zwitscherService.login(adminUser);

    zwitscherService.deleteAllUsers();
    zwitscherService.deleteAllTweets();

    zwitscherService.logout();
  });

  test('post a tweet', function () {
    zwitscherService.logout();
    zwitscherService.login(user);

    const returnedTweet = zwitscherService.postTweet(newTweet);
    assert(_.some([returnedTweet], newTweet), 'returnedTweet must be a superset of newTweet');
    assert.isDefined(returnedTweet._id);
  });

  test('post a tweet with picture', function (done) {
    zwitscherService.logout();
    zwitscherService.login(user);

    let tweetWithPicture = {
      message: newTweet.message,
    };

    fs.readFile('public/images/profilePictures/male1.jpg', (err, data) => {
      tweetWithPicture.image = new Buffer(data).toString('base64');

      const returnedTweet = zwitscherService.postTweet(tweetWithPicture);
      assert.equal(returnedTweet.message, tweetWithPicture.message);
      assert.isDefined(returnedTweet.imagePath);
      assert(returnedTweet.imagePath.startsWith('https://storage.googleapis.com/glowing-fire-9226.appspot.com'));
      assert.isDefined(returnedTweet._id);

      done();
    });

    // fs.readFile('//D:/_images/profilePictures/male1.jpg', function (err, data) {
    //   if (err) throw err; // Fail if the file can't be read.
    //
    //   newTweet.image = data;
    //
    //   const returnedTweet = zwitscherService.postTweet(newTweet);
    //   assert(_.some([returnedTweet], newTweet), 'returnedTweet must be a superset of newTweet');
    //   assert.isDefined(returnedTweet._id);
    //
    //   done();
    // });

  });

  test('post a tweet with invalid picture', function () {
    zwitscherService.logout();
    zwitscherService.login(user);

    let tweetWithPicture = {
      message: newTweet.message,
    };

    tweetWithPicture.image = 'NotBase64EncodedString';

    const returnedTweet = zwitscherService.postTweet(tweetWithPicture);

    assert.isNull(returnedTweet);

  });

  test('get tweet', function () {
    zwitscherService.logout();
    zwitscherService.login(user);

    const tweet1 = zwitscherService.postTweet(newTweet);
    const tweet2 = zwitscherService.getTweet(tweet1._id);
    assert.deepEqual(tweet1, tweet2);
  });

  test('get invalid tweet', function () {
    zwitscherService.logout();
    zwitscherService.login(user);

    const tweet1 = zwitscherService.getTweet('1234');
    assert.isNull(tweet1);
    const tweet2 = zwitscherService.getTweet('012345678901234567890123');
    assert.isNull(tweet2);
  });

  test('delete a tweet', function () {
    zwitscherService.logout();
    zwitscherService.login(user);

    const tweet = zwitscherService.postTweet(newTweet);
    assert(zwitscherService.getTweet(tweet._id) != null);
    zwitscherService.deleteOneTweet(tweet._id);
    assert(zwitscherService.getTweet(tweet._id) == null);
  });

  test('delete multiple tweets', function () {

    zwitscherService.logout();
    zwitscherService.login(user);

    const tweets = zwitscherService.getAllTweets();
    assert.equal(tweets.length, 4);

    let tweetsToDelete = [];
    tweetsToDelete.push(tweets[0]._id);
    tweetsToDelete.push(tweets[1]._id);
    tweetsToDelete.push(tweets[2]._id);

    zwitscherService.deleteMultipleTweets(JSON.stringify(tweetsToDelete));

    const remainingTweets = zwitscherService.getAllTweets();

    assert.equal(remainingTweets.length, 1);

  });

  test('get all tweets', function () {
    zwitscherService.logout();
    zwitscherService.login(user);

    const allTweets = zwitscherService.getAllTweets();
    assert.equal(allTweets.length, tweets.length);
  });

  test('get all tweets detail', function () {
    zwitscherService.logout();
    zwitscherService.login(user);

    const allTweets = zwitscherService.getAllTweets();

    for (var i = 0; i < tweets.length; i++) {
      assert(_.some([allTweets[i]], tweets[i]), 'allTweets must be a superset of tweets');
    }
  });

  test('delete all tweets', function () {
    zwitscherService.logout();
    zwitscherService.login(user);

    let allTweets = zwitscherService.getAllTweets();
    assert(allTweets.length > 1);

    zwitscherService.logout();
    zwitscherService.login(adminUser);

    zwitscherService.deleteAllTweets();

    zwitscherService.logout();
    zwitscherService.login(user);

    allTweets = zwitscherService.getAllTweets();

    assert.equal(allTweets.length, 0);
  });

  test('delete all tweets fails for normal user', function () {
    zwitscherService.logout();
    zwitscherService.login(user);

    let allTweets = zwitscherService.getAllTweets();
    assert(allTweets.length > 1);

    const code = zwitscherService.deleteAllTweets();

    allTweets = zwitscherService.getAllTweets();

    assert(allTweets.length > 1);
    assert(code, 403);
  });

  test('get all tweets from user', function () {
    zwitscherService.logout();
    zwitscherService.login(user);

    // const createdUser = zwitscherService.createUser(user);
    // zwitscherService.logout();
    // zwitscherService.login(createdUser);
    //
    // tweets.forEach(tweet => {
    //   zwitscherService.postTweet(tweet);
    // })

    const allUsers = zwitscherService.getUsers();
    let userID;
    allUsers.forEach(currentUser => {
      if (currentUser.email === user.email) {
        userID = currentUser._id;
      }
    });
    const allTweets = zwitscherService.getAllTweetsForUser(userID);

    assert.equal(allTweets.length, tweets.length);
  });
});
