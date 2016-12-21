const UsersApi = require('./app/api/usersapi');
const TweetsApi = require('./app/api/tweetsapi');

module.exports = [

  { method: 'GET', path: '/api/users', config: UsersApi.findAllUsers },
  { method: 'GET', path: '/api/users/{id}', config: UsersApi.findOneUser },
  { method: 'POST', path: '/api/users', config: UsersApi.createUser },
  { method: 'POST', path: '/api/users/authenticate', config: UsersApi.authenticateUser },
  { method: 'POST', path: '/api/users/{id}/follow', config: UsersApi.followUser },
  { method: 'POST', path: '/api/users/{id}/unfollow', config: UsersApi.unfollowUser },
  { method: 'DELETE', path: '/api/users/{id}', config: UsersApi.deleteOneUser },
  { method: 'DELETE', path: '/api/users', config: UsersApi.deleteAllUsers },

  { method: 'GET', path: '/api/tweets/{id}', config: TweetsApi.findOneTweet },
  { method: 'GET', path: '/api/tweets', config: TweetsApi.findAllTweets },
  { method: 'GET', path: '/api/tweets/users/{id}', config: TweetsApi.findAllTweetsForUser },
  { method: 'GET', path: '/api/users/{id}/tweets', config: TweetsApi.findAllTweetsByUser },
  { method: 'POST', path: '/api/tweets', config: TweetsApi.postTweet },
  { method: 'DELETE', path: '/api/tweets', config: TweetsApi.deleteAllTweets },
  { method: 'DELETE', path: '/api/tweets/{id}', config: TweetsApi.deleteOneTweet },

  { method: 'POST', path: '/api/deleteTweetsJob/{tweetsToDelete}', config: TweetsApi.deleteMultipleTweets },
  { method: 'POST', path: '/api/deleteUsersJob/{usersToDelete}', config: UsersApi.deleteMultipleUsers },

];
