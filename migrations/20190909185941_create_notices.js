exports.up = function(knex) {
  return knex.schema
    .createTable('notices', function (table) {
      table.increments('id');
      table.string('description');
      table.string('link', 32).nullable();
      table.string('url').nullable();
    })
    .createTable('users', function (table) {
      table.increments('id');
      table.string('student_id', 10);
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('notices')
    .dropTable('users');
};
