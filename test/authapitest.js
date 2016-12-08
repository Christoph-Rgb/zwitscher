'use strict';

const assert = require('chai').assert;
const ZwitscherService = require('./zwitscher-service');
const fixtures = require('./fixtures.json');
const utils = require('../app/api/utils.js');

suite('Auth API tests', function () {
  const adminUser = fixtures.users[0];

  const zwitscherService = new ZwitscherService(fixtures.zwitscherService);

  beforeEach(function () {
  });

  afterEach(function () {
  });

  test('login-logout', function () {
    var returnedUsers = zwitscherService.getUsers();
    assert.isNull(returnedUsers);

    const response = zwitscherService.login(adminUser);
    returnedUsers = zwitscherService.getUsers();
    assert.isNotNull(returnedUsers);

    zwitscherService.logout();
    returnedUsers = zwitscherService.getUsers();
    assert.isNull(returnedUsers);
  });

});
