'use strict';
/**
 * Middleware function for development environments. Replaces the authentication
 * middleware (/lib/middleware.js) and adds a user on to the request object
 *
 * @param req
 * @param res
 * @param next
 */
export default function (settings) {
  return function impersonateUser(req, res, next) {
    if (settings.exclude.test(req.path)) {
      next();
      return;
    }

    if (settings.impersonateAs) {
      req.user = settings.impersonateAs;
    } else {
      req.user = {
        Corpid: 'johndoe',
        FirstName: 'John',
        LastName: 'Doe',
        Email: 'johndoe@ebay.com',
        QID: 'Q10110000',
        Type: 'Employee',
        DisplayName: 'Doe, John',
      };
    }

    res.locals.user = req.user;
    if (req.session && req.session.passport) {
      req.session.passport.user = req.session.passport.user || {};
      req.session.passport.user = JSON.stringify(req.user);
    }
    next();
  };
}
