'use strict';

const assert = require('chai').assert;
const ZwitscherService = require('./zwitscher-service');
const fixtures = require('./fixtures.json');
const _ = require('lodash');

suite('User API tests', function () {

  let adminUser = fixtures.users[0];
  let user = fixtures.users[1];
  let users = fixtures.users;
  let newUser = fixtures.newUser;
  const tweets = fixtures.tweets;
  const zwitscherService = new ZwitscherService(fixtures.zwitscherService);

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

  test('create a user', function () {
    const returnedUser = zwitscherService.createUser(newUser);
    assert(_.some([returnedUser], newUser), 'returnedUser must be a superset of newUser');
    assert.isDefined(returnedUser._id);
  });

  test('get user', function () {
    const user1 = zwitscherService.createUser(newUser);
    const user2 = zwitscherService.getUser(user1._id);
    assert.deepEqual(user1, user2);
  });

  test('follow another user', function () {
    const allUsers = zwitscherService.getUsers();
    const followingUser = zwitscherService.followUser(allUsers[0]._id);

    assert.equal(followingUser.follows.length, 1);
    assert.equal(followingUser.follows[0], allUsers[0]._id);
  });

  test('unfollow another user', function () {
    const allUsers = zwitscherService.getUsers();
    const followingUser = zwitscherService.followUser(allUsers[0]._id);
    assert.equal(followingUser.follows.length, 1);
    assert.equal(followingUser.follows[0], allUsers[0]._id);

    const unfollowingUser = zwitscherService.unfollowUser(allUsers[0]._id);
    assert.equal(unfollowingUser.follows.length, 0);
  });

  test('get all users', function () {
    const allUsers = zwitscherService.getUsers();
    assert.equal(allUsers.length, users.length);
  });

  test('get user detail', function () {
    const allUsers = zwitscherService.getUsers();
    for (var i = 0; i < users.length; i++) {
      assert(_.some([allUsers[i]], users[i]), 'returnedUser must be a superset of newUser');
    }
  });

  test('get invalid user', function () {
    const user1 = zwitscherService.getUser('1234');
    assert.isNull(user1);
    const user2 = zwitscherService.getUser('012345678901234567890123');
    assert.isNull(user2);
  });

  test('delete user without permission', function () {
    const createdUser = zwitscherService.createUser(newUser);
    assert(zwitscherService.getUser(createdUser._id) != null);

    const code = zwitscherService.deleteOneUser(createdUser._id);
    assert.equal(code, 403);

    const createdUserVerify = zwitscherService.getUser(createdUser._id);
    assert(createdUserVerify != null);

    zwitscherService.logout();
    zwitscherService.login(adminUser);
    zwitscherService.deleteOneUser(createdUser._id);
  });

  test('delete own user', function () {
    const createdUser = zwitscherService.createUser(newUser);
    assert(zwitscherService.getUser(createdUser._id) != null);

    zwitscherService.logout();
    zwitscherService.login(createdUser);

    zwitscherService.deleteOneUser(createdUser._id);

    zwitscherService.logout();
    zwitscherService.login(user);

    const createdUserVerify = zwitscherService.getUser(createdUser._id);
    assert(createdUserVerify == null);
  });

  test('delete user as admin', function () {

    zwitscherService.logout();
    zwitscherService.login(adminUser);

    const u = zwitscherService.createUser(newUser);
    assert(zwitscherService.getUser(u._id) != null);
    zwitscherService.deleteOneUser(u._id);
    assert(zwitscherService.getUser(u._id) == null);
  });

  test('delete multiple users as admin', function () {

    zwitscherService.logout();
    zwitscherService.login(adminUser);

    const users = zwitscherService.getUsers();
    assert.equal(users.length, 4);

    let usersToDelete = [];
    usersToDelete.push(users[1]._id);
    usersToDelete.push(users[2]._id);
    usersToDelete.push(users[3]._id);

    zwitscherService.deleteMultipleUsers(JSON.stringify(usersToDelete));

    const remainingUsers = zwitscherService.getUsers();

    assert.equal(remainingUsers.length, 1);

  });

  test('delete multiple users without permission fails', function () {
    const users = zwitscherService.getUsers();
    assert.equal(users.length, 4);

    let usersToDelete = [];
    usersToDelete.push(users[2]._id);
    usersToDelete.push(users[3]._id);

    zwitscherService.deleteMultipleUsers(JSON.stringify(usersToDelete));

    const remainingUsers = zwitscherService.getUsers();

    assert.equal(remainingUsers.length, 4);

  });

  test('delete all users as user without permission', function () {
    const code = zwitscherService.deleteAllUsers();
    assert.equal(code, 403);

    assert(zwitscherService.getUsers().length > 1);
  });

  test('delete all users as admin', function () {
    zwitscherService.logout();
    zwitscherService.login(adminUser);

    zwitscherService.deleteAllUsers();

    assert.equal(zwitscherService.getUsers().length, 1);
  });
});
