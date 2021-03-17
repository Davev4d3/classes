const { settings } = require('./server/pg-pool');

module.exports = {
  development: {
    client: 'mysql',
    connection: {host: '127.0.0.1', user: 'root', password: '', database: 'classes'}
  },
  staging: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {min: 2, max: 10},
    migrations: {tableName: 'knex_migrations'}
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {min: 2, max: 10},
    migrations: {tableName: 'knex_migrations'},
    ...settings.ssl
  }
};
