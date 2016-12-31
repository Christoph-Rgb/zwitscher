'use strict';

const Hapi = require('hapi');
const utils = require('./app/api/utils.js');
const corsHeaders = require('hapi-cors-headers');

//register helper function for handlebars
const Handlebars = require('handlebars');
Handlebars.registerHelper('select', function (value, options) {
  return options.fn(this)
      .split('\n')
      .map(function (v) {
        var t = 'value="' + value + '"';
        return !RegExp(t).test(v) ? v : v.replace(t, t + ' selected="selected"');
      })
      .join('\n');
});

var server = new Hapi.Server();
server.connection({ port: process.env.PORT || 4000 });

require('./app/models/db');

server.register([require('inert'), require('vision'), require('hapi-auth-cookie'),
                require('hapi-auth-jwt2')], err => {

  if (err) {
    throw err;
  }

  server.views({
    engines: {
      hbs: require('handlebars'),
    },
    relativeTo: __dirname,
    path: './app/views',
    layoutPath: './app/views/layout',
    partialsPath: './app/views/partials',
    layout: true,
    isCached: false,
  });

  server.auth.strategy('standard', 'cookie', {
    password: 'secretpasswordnotrevealedtoanyone',
    cookie: 'donation-cookie',
    isSecure: false,
    ttl: 24 * 60 * 60 * 1000,
    redirectTo: '/login',
  });

  server.auth.strategy('jwt', 'jwt', {
    key: 'secretpasswordnotrevealedtoanyone',
    validateFunc: utils.validate,
    verifyOptions: { algorithms: ['HS256'] },
  });

  server.auth.default({
    strategy: 'standard',
  });

  server.ext('onPreResponse', corsHeaders);
  server.route(require('./routes'));
  server.route(require('./routesapi'));

  server.start((err) => {
    if (err) {
      throw err;
    }

    console.log('Server listening at:', server.info.uri);
  });

});
