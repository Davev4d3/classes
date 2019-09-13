const production = process.env.NODE_ENV === 'production';
const db = require('knex')(require('../knexfile')[production ? 'production' : 'development']);

module.exports = db;