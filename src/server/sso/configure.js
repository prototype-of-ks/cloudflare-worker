import * as ssoUtil from './util.js';
import path2Regexp from 'path-to-regexp';
import { Strategy as SamlEncryptedStrategy } from 'passport-saml-encrypted';
import _ from 'underscore';

// Default settings for the module.
const defaultSettings = {
  protocol: 'https://',
  logging: true,
  encryptedSAML: true,
  identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
  appLogin: '/login',
  samlPostback: '/saml/acs',
  flash: true,
};
/**
 * setupPassport - add the encrypted SAML passport strategy to the passport
 * instance and then register serialization and deserialization strategies.
 */
function setupPassport(settings, passport) {
  // Build a new authentication strategy and pass it to passport.
  passport.use(
    new SamlEncryptedStrategy(settings, function (user, done) {
      done(null, user);
    })
  );
  passport.serializeUser(function serializeUser(user, done) {
    done(null, JSON.stringify(user));
  });
  passport.deserializeUser(function deserializeUser(serializedUser, done) {
    done(null, JSON.parse(serializedUser));
  });
}

/**
 * Pull in user provided settings and configure passport and override any default
 * configurations the user may want to set.
 *
 * @param  {type} config   description
 * @param  {type} passport description
 * @return {type}          description
 */
export default function configure(config, passport) {
  let exclude = [
      config.mountpath + defaultSettings.appLogin,
      config.mountpath + defaultSettings.samlPostback,
    ],
    confExclude = config.exclude,
    settings;

  // If the user provides exclude routes, add them to the list
  if (confExclude && _.isArray(confExclude)) {
    exclude = _.union(exclude, confExclude);
  }

  // Override default settings from user provided settings and get the user provided root url.
  settings = _.extend(defaultSettings, config);
  // Build a single regular expression for all excluded urls
  settings.exclude = path2Regexp(exclude);

  if (!settings.failureRedirect) {
    settings.failureRedirect = config.mountpath;
  }

  // Set up the post back url for the SAML responses
  settings.path =
    (config.mountpath === '/' ? '' : config.mountpath) + settings.samlPostback;

  // If we're not in dev mode, pull in the private certificate for request signing
  if (!config.devMode) {
    settings.privateCert = ssoUtil.readSSOCert(
      settings.privateCertPath,
      settings.passphrase
    );
  }

  // Set up the passport instance with configuration
  setupPassport(settings, passport);

  return settings;
}
