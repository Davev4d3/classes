const db = require('./database');

function respondError(res, message, status) {
  res.status(status).json({error: {message, status}})
}

function respondErrorBadRequest(r) {
  respondError(r, 'Bad Request', 400)
}

function respondErrorInternal(r, e) {
  console.warn(e);
  respondError(r, 'Internal Error', 500)
}

function respond(res, data) {
  res.json({error: null, data})
}

function respondSuccess(res) {
  res.json({error: null})
}

module.exports = function (app) {
  app.get('/api/notice', function (req, res) {
    db('notices')
      .select('description', 'link', 'url')
      .then(data => respond(res, data))
      .catch(e => respondErrorInternal(res, e))
  });
};
