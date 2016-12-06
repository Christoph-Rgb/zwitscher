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

  const zwitscherService = new ZwitscherService(fixtures.donationService);

  beforeEach(function () {
    zwitscherService.login(user);
  });

  afterEach(function () {
    zwitscherService.logout();
  });

  test('create a user', function () {
    const returnedUser = zwitscherService.createUser(newUser);
    assert(_.some([returnedUser], newUser), 'returnedUser must be a superset of newUser');
    assert.isDefined(returnedUser._id);

    zwitscherService.deleteOneUser(returnedUser._id);

  });

  test('get user', function () {
    const user1 = zwitscherService.createUser(newUser);
    const user2 = zwitscherService.getUser(user1._id);
    assert.deepEqual(user1, user2);

    zwitscherService.deleteOneUser(user1._id);
  });

  test('get invalid user', function () {
    const user1 = zwitscherService.getUser('1234');
    assert.isNull(user1);
    const user2 = zwitscherService.getUser('012345678901234567890123');
    assert.isNull(user2);
  });

  test('delete a user', function () {
    const u = zwitscherService.createUser(newUser);
    assert(zwitscherService.getUser(u._id) != null);
    zwitscherService.deleteOneUser(u._id);
    assert(zwitscherService.getUser(u._id) == null);
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
});