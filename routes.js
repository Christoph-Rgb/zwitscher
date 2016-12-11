const Accounts = require('./app/controllers/accounts');
const Home = require('./app/controllers/home');
const User = require('./app/controllers/users');
const UserTimeline = require('./app/controllers/userTimeline');
const GlobalTimeline = require('./app/controllers/globalTimeline');
const Assets = require('./app/controllers/assets');

module.exports = [

  { method: 'GET', path: '/', config: Accounts.main },
  { method: 'GET', path: '/home', config: GlobalTimeline.globalTimeline },

  { method: 'GET', path: '/users', config: User.users },

  { method: 'GET', path: '/signup', config: Accounts.signup },
  { method: 'POST', path: '/register', config: Accounts.register },
  { method: 'GET', path: '/login', config: Accounts.login },
  { method: 'POST', path: '/login', config: Accounts.authenticate },
  { method: 'GET', path: '/logout', config: Accounts.logout },
  { method: 'POST', path: '/removeUser', config: Accounts.removeUser },

  { method: 'GET', path: '/globalTimeline', config: GlobalTimeline.globalTimeline },
  { method: 'POST', path: '/globalTimeline/postTweet', config: GlobalTimeline.postTweet },
  { method: 'POST', path: '/globalTimeline/deleteTweet', config: GlobalTimeline.deleteTweet },

  { method: 'GET', path: '/userTimeline/{id}', config: UserTimeline.userTimeline },
  { method: 'POST', path: '/userTimeline/postTweet', config: UserTimeline.postTweet },
  { method: 'POST', path: '/userTimeline/deleteTweet', config: UserTimeline.deleteTweet },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
