'use strict';

const assert = require('chai').assert;
const ZwitscherService = require('./zwitscher-service');
const fixtures = require('./fixtures.json');
const _ = require('lodash');

suite('User API tests', function () {

  let users = fixtures.users;
  let newUser = fixtures.newUser;

  const zwitscherService = new ZwitscherService(fixtures.donationService);

  beforeEach(function () {
    zwitscherService.login(users[0]);
    // zwitscherService.deleteAllUsers();
  });

  afterEach(function () {
    // zwitscherService.deleteAllUsers();
    zwitscherService.logout();
  });

  test('create a user', function () {
    const returnedUser = zwitscherService.createUser(newUser);
    assert(_.some([returnedUser], newUser), 'returnedUser must be a superset of newUser');
    assert.isDefined(returnedUser._id);
  });

  test('get user', function () {
    const u1 = zwitscherService.createUser(newUser);
    const u2 = zwitscherService.getUser(u1._id);
    assert.deepEqual(u1, u2);
  });

  test('get invalid user', function () {
    const u1 = zwitscherService.getUser('1234');
    assert.isNull(u1);
    const u2 = zwitscherService.getUser('012345678901234567890123');
    assert.isNull(u2);
  });

  test('delete a user', function () {
    const u = zwitscherService.createUser(newUser);
    assert(zwitscherService.getUser(u._id) != null);
    zwitscherService.deleteOneUser(u._id);
    assert(zwitscherService.getUser(u._id) == null);
  });

  // test('get all users', function () {
  //   for (let u of users) {
  //     zwitscherService.createUser(u);
  //   }
  //
  //   const allUsers = zwitscherService.getUsers();
  //   assert.equal(allUsers.length, users.length);
  // });

  // test('get users detail', function () {
  //   for (let u of users) {
  //     zwitscherService.createUser(u);
  //   }
  //
  //   const allUsers = zwitscherService.getUsers();
  //   for (var i = 0; i < users.length; i++) {
  //     assert(_.some([allUsers[i]], users[i]), 'returnedUser must be a superset of newUser');
  //   }
  // });

  // test('get all users empty', function () {
  //   const allUsers = zwitscherService.getUsers();
  //   assert.equal(allUsers.length, 0);
  // });
});