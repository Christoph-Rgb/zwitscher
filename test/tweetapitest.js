'use strict';

const assert = require('chai').assert;
const ZwitscherService = require('./zwitscher-service');
const fixtures = require('./fixtures.json');
const _ = require('lodash');

suite('Tweet API tests', function () {

  let adminUser = fixtures.users[0];
  let user = fixtures.users[1];
  let users = fixtures.users;
  let tweets = fixtures.tweets;
  let newTweet = fixtures.newTweet;

  let zwitscherService = new ZwitscherService(fixtures.zwitscherService);

  beforeEach(function () {

    zwitscherService.login(adminUser);
    zwitscherService.deleteAllUsers();

    for (let i = 1; i < users.length; i++) {
      zwitscherService.createUser(users[i]);
    }

    zwitscherService.deleteAllTweets();

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

  test('create a tweet', function () {
    zwitscherService.logout();
    zwitscherService.login(user);

    const returnedTweet = zwitscherService.postTweet(newTweet);
    assert(_.some([returnedTweet], newTweet), 'returnedTweet must be a superset of newTweet');
    assert.isDefined(returnedTweet._id);
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
