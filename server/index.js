const express = require('express');
const session = require('express-session');
const compression = require('compression');
const path = require('path');
const pgSession = require('connect-pg-simple')(session);

const PORT = process.env.PORT || 8080;
const IP = process.env.IP || '0.0.0.0';

const app = express();

app.use(compression());

app.use(session({
  store: process.env.NODE_ENV === 'production' ? new pgSession({
    conString: process.env.DATABASE_URL
  }) : null,
  secret: process.env.COOKIE_SECRET || 'secret',
  saveUninitialized: false,
  resave: false,
  cookie: {maxAge: 90 * 24 * 60 * 60 * 1000} // 90 Days
}));

// Redirect all www requests to non-www
function wwwRedirect(req, res, next) {
  if (req.headers.host.slice(0, 4) === 'www.') {
    return res.redirect(301, req.protocol + '://' + req.headers.host.slice(4) + req.originalUrl);
  }
  next();
}

app.set('trust proxy', true);
app.use(wwwRedirect);

app.use(express.static(path.join(path.dirname(__dirname), 'public')));

require('./auth')(
  app,
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

require('./api')(app);

app.listen(PORT, IP, function () {
  console.log('Server up on ' + IP + ':' + PORT + '!');
});