const Accounts = require('./app/controllers/accounts');
const Home = require('./app/controllers/home');
const Users = require('./app/controllers/users');
const Tweets = require('./app/controllers/tweets');
const Assets = require('./app/controllers/assets');

module.exports = [

  { method: 'GET', path: '/', config: Accounts.main },
  { method: 'GET', path: '/home', config: Tweets.showGlobalTimeline },

  { method: 'GET', path: '/users', config: Users.users },
  { method: 'POST', path: '/followUser', config: Users.followUser },
  { method: 'POST', path: '/unfollowUser', config: Users.unfollowUser },

  { method: 'GET', path: '/signup', config: Accounts.signup },
  { method: 'POST', path: '/register', config: Accounts.register },
  { method: 'GET', path: '/login', config: Accounts.login },
  { method: 'POST', path: '/login', config: Accounts.authenticate },
  { method: 'GET', path: '/logout', config: Accounts.logout },
  { method: 'GET', path: '/settings', config: Accounts.viewSettings },
  { method: 'POST', path: '/settings', config: Accounts.updateSettings },
  { method: 'POST', path: '/users/removeUser', config: Accounts.removeUser },
  { method: 'POST', path: '/users/removeUsers', config: Accounts.removeMultipleUsers },

  { method: 'GET', path: '/globalTimeline', config: Tweets.showGlobalTimeline },
  { method: 'POST', path: '/globalTimeline/postTweet', config: Tweets.postTweetGlobalTimeline },
  { method: 'POST', path: '/globalTimeline/deleteTweet', config: Tweets.deleteTweetGlobalTimeline },
  { method: 'POST', path: '/globalTimeline/deleteTweets', config: Tweets.deleteMultipleTweetsGlobalTimeline },

  { method: 'GET', path: '/userTimeline/{id}', config: Tweets.showUserTimeline },
  { method: 'POST', path: '/userTimeline/postTweet', config: Tweets.postTweetUserTimeline },
  { method: 'POST', path: '/userTimeline/deleteTweet', config: Tweets.deleteTweetUserTimeline },
  { method: 'POST', path: '/userTimeline/deleteTweets', config: Tweets.deleteMultipleTweetsUserTimeline },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
