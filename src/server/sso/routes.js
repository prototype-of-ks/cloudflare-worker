'use strict';

/**
 * addRoutes - Adds the required routes for both login and saml response posting
 * for paypal SSO integration
 *
 * @param  {Object} app    Express 4 app object to attach routes to
 * @param  {Object} settings
 * @param  {Object} passport Passport.js instance
 */
export default function addRoutes(app, settings, passport) {
  // Register the application login url. Defaults to /login
  app.get(
    settings.mountpath + settings.appLogin,
    passport.authenticate('saml', {
      failureRedirect: settings.failureRedirect,
      failureFlash: settings.flash,
    }),
    function (req, res) {
      res.redirect(settings.mountpath);
    },
  );

  // Register an endpoint for the SSO service to redirect the browser to with the users SAML token. Redirects the user
  // to where they were originally going if it's been saved to the session, otherwise redirects to app root. Defaults
  // to /saml/acs
  app.post(
    settings.mountpath + settings.samlPostback, 
    passport.authenticate('saml', {
      failureRedirect: settings.failureRedirect,
      failureFlash: settings.flash,
    }),
    function (req, res) {
      var goingTo;
      if (req.session && req.session.goingTo) {
        goingTo = req.session.goingTo;
      }
      let tempSession = req.session;

      req.session.regenerate(() => {
        Object.assign(req.session, tempSession);
        res.redirect(goingTo || settings.mountpath || '/');
      });
    },
  );
}
