'use strict';

const SyncHttpService = require('./sync-http-service');
const baseUrl = 'http://localhost:4000';

class ZwitscherService {

  constructor(baseUrl) {
    this.httpService = new SyncHttpService(baseUrl);
  }

  getUsers() {
    return this.httpService.get('/api/users');
  }

  getUser(id) {
    return this.httpService.get('/api/users/' + id);
  }

  createUser(newUser) {
    return this.httpService.post('/api/users', newUser);
  }

  deleteAllUsers() {
    return this.httpService.delete('/api/users');
  }

  deleteOneUser(id) {
    return this.httpService.delete('/api/users/' + id);
  }

  getTweet(id) {
    return this.httpService.get('/api/tweets/' + id);
  }

  getAllTweets() {
    return this.httpService.get('/api/tweets');
  }

  getAllTweetsForUser(id) {
    return this.httpService.get('/api/users/' + id + '/tweets');
  }

  postTweet(newTweet) {
    return this.httpService.post('/api/tweets', newTweet);
  }

  deleteOneTweet(id) {
    return this.httpService.delete('/api/tweets/' + id);
  }

  deleteAllTweets() {
    return this.httpService.delete('/api/tweets');
  }

  login(user) {
    return this.httpService.setAuth('/api/users/authenticate', user);
  }

  logout() {
    this.httpService.clearAuth();
  }

}

module.exports = ZwitscherService;
