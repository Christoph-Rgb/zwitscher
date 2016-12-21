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

  followUser(id) {
    return this.httpService.post('/api/users/' + id + '/follow');
  }

  unfollowUser(id) {
    return this.httpService.post('/api/users/' + id + '/unfollow');
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

  deleteMultipleUsers(usersToDelete) {
    return this.httpService.post('/api/deleteUsersJob/' + usersToDelete);
  }

  getTweet(id) {
    return this.httpService.get('/api/tweets/' + id);
  }

  getAllTweets() {
    return this.httpService.get('/api/tweets');
  }

  getAllTweetsByUser(id) {
    return this.httpService.get('/api/users/' + id + '/tweets');
  }

  getAllTweetsForUser(id) {
    return this.httpService.get('/api/tweets/users/' + id);
  }

  postTweet(newTweet) {
    return this.httpService.post('/api/tweets', newTweet);
  }

  deleteOneTweet(id) {
    return this.httpService.delete('/api/tweets/' + id);
  }

  deleteMultipleTweets(tweetsToDelete) {
    return this.httpService.post('/api/deleteTweetsJob/' + tweetsToDelete);
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
