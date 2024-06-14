'use strict';

import passport from 'passport';
import flash from 'connect-flash';
import addRoutes from './routes.js';
import middleware from './middleware.js';
import devMiddleware from './devMiddleware.js';
import configure from './configure.js';
import express from 'express';

/**
 * Factory function for registering SSO middleware. Creates a new express sub
 * app to be mounted on the main application. On mounting, the app sets up
 * login and saml post back routes, all passport middleware, and the actual
 * authentication middleware.
 *
 * @param config Configuration object
 * @returns express sub app
 */
export default function ssoFactory(config) {
  var app = express();

  app.once('mount', function onmount(parent) {
    // Remove sacrificial express app
    parent._router.stack.pop();

    config.mountpath = app.mountpath === '/' ? '' : app.mountpath;

    // This allows us to support both Brogan 1.x and 2.x. If the user provides a passphrase,
    // we can just use it (either comes plain text in config file or via vault:key_name).
    // IF they provide a passphraseKey, it means that we're going to have to
    // get it out of the configs.
    if (!config.passphrase && config.passphraseKey) {
      config.passphrase = parent.kraken.get('vault:keys:' + config.passphraseKey);
    }

    var settings = configure(config, passport);

    parent.use(passport.initialize());
    parent.use(passport.session());
    if (settings.flash) {
      parent.use(flash());
    }
    parent.use(config.devMode === true ? devMiddleware(settings) : middleware(settings));

    addRoutes(parent, settings, passport);
  });

  return app;
}
