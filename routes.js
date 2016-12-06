const Accounts = require('./app/controllers/accounts');
const Home = require('./app/controllers/home');
const UserTimeline = require('./app/controllers/userTimeline');
const Assets = require('./app/controllers/assets');

module.exports = [

  { method: 'GET', path: '/', config: Accounts.main },

  { method: 'GET', path: '/signup', config: Accounts.signup },
  { method: 'POST', path: '/register', config: Accounts.register },

  { method: 'GET', path: '/login', config: Accounts.login },
  { method: 'POST', path: '/login', config: Accounts.authenticate },

  { method: 'GET', path: '/logout', config: Accounts.logout },

  { method: 'GET', path: '/home', config: Home.home },

  { method: 'GET', path: '/userTimeline/{id}', config: UserTimeline.userTimeline },
  { method: 'POST', path: '/postTweet', config: UserTimeline.postTweet },
  { method: 'POST', path: '/deleteTweet', config: UserTimeline.deleteTweet },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
