const settings = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = process.env.NODE_ENV === 'production' ? (
  pool = new (require('pg')).Pool({
    ...settings
  })
) : null;

module.exports = {
  pool,
  settings
};
