module.exports = function (app, clientID, clientSecret, host) {
  'use strict';

  var redirectURI = host + '/auth/callback';

  var config = {
    clientID: clientID,
    clientSecret: clientSecret,

    site: 'https://student.sbhs.net.au/api',
    tokenPath: '/token',
    authorizationPath: '/authorize',
    revocationPath: '/revoke'
  };

  var oauth2 = require('simple-oauth2')(config);

  var authorization_uri = oauth2.authCode.authorizeURL({
    redirect_uri: redirectURI,
    scope: 'all-ro',
    state: '1234' //TODO: Find something a bit better to do with the state.
  });

  app.get('/auth/login', function (req, res) {
      res.redirect(authorization_uri);
  });

  app.get('/auth/logout', function (req, res) {
      delete req.session.token;
      res.redirect('/');
  });

  app.get('/auth/callback', function (req, res) {
    var code = req.query.code;

    oauth2.authCode.getToken({
      code: code,
      redirect_uri: redirectURI
    }, saveToken);

    function saveToken(error, result) {
      if (error) {
        res.status(500).send({ error: 'token fetch error' }); //TODO: We need better errors.
        console.error('Token Fetch Error', error);
        return;
      }

      req.session.token = {
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expires: Date.now() + (result.expires_in * 1000)
      };

      res.redirect('/');
    }
  });

  app.get('/auth/token', function (req, res) {
    if (req.session.token) {
      if (Date.now() < req.session.token.expires) {
        res.json({
          accessToken: req.session.token.accessToken,
          expires: req.session.token.expires
        });
      } else {
          //TODO: Duplication of /auth/refresh. Maybe redirect, maybe make a function.
        oauth2.api('POST', config.tokenPath, {
          grant_type: 'refresh_token',
          refresh_token: req.session.token.refreshToken
        }, function (error, result) {
          if (error) {
            res.status(500).send({ error: 'token refresh error' }); //TODO: We need better errors.
            console.error('Token Refresh Error', error);
            return;
          }

          req.session.token.accessToken = result.access_token;
          req.session.token.expires = Date.now() + (result.expires_in * 1000);

          res.json({
            accessToken: req.session.token.accessToken,
            expires: req.session.token.expires
          });
        });
      }
    } else {
      res.status(403).json({ error: 'unauthenticated' });
    }
  });

  app.get('/auth/refresh', function (req, res) {
    if (req.session.token) {
      oauth2.api('POST', config.tokenPath, {
        grant_type: 'refresh_token',
        refresh_token: req.session.token.refreshToken
      }, function (error, result) {
        if (error) {
          res.status(500).send({ error: 'token refresh error' }); //TODO: We need better errors.
          console.error('Token Refresh Error', error);
          return;
        }

        req.session.token.accessToken = result.access_token;
        req.session.token.expires = Date.now() + (result.expires_in * 1000);

        res.json({
          accessToken: req.session.token.accessToken,
          expires: req.session.token.expires
        });
      });
    } else {
      res.status(403).json({ error: 'unauthenticated' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    app.get('/api/session/get', function (req, res) {
      res.json(req.session.testValue);
    });

    app.get('/api/session/set', function (req, res) {
      req.session.testValue = {
        key: 'value',
      };
      res.json({ error: null });
    });
  }
};
