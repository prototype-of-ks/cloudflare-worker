'use strict';

/**
 * Middleware function that checks to see if the user has been authenticated.
 *
 * @param req
 * @param res
 * @param next
 */
export default function (settings) {
  var login = settings.mountpath + settings.appLogin;
  return function ssoAuthenticate(req, res, next) {
    var jwtAccessToken;
    if (settings.bypassSSO && settings.bypassSSO.enabled) {
      jwtAccessToken = req.get(`${settings.bypassSSO.authKey}`);
    }

    // If the requested path matches one of the exclude regex's, let the request pass through
    // Skip SSO validation  if header is having Authorization
    if (settings.exclude.test(req.path) || jwtAccessToken) {
      next();
      return;
    }

    // If the user is not authenticated, save where they were going and redirect to login. Otherwise, save the user
    // to res.locals and pass the request through.

    if (!req.isAuthenticated()) {
      if (
        settings.ajaxTimeoutStatus &&
        req.xhr &&
        req.session &&
        req.session.passport &&
        !req.session.passport.user
      ) {
        var code = 440;
        var message = 'Session Expired';

        res.writeHead(code, message, { 'content-type': 'application/json' });
        var err = {
          code: code,
          error: message,
        };
        res.end(JSON.stringify(err));
      } else {
        if (req.session) {
          req.session.goingTo = req.url;
        }
        res.redirect(login);
      }
    } else {
      res.locals.user = req.user;
      next();
    }
  };
}
