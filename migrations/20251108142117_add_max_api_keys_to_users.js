exports.up = function (knex) {
  return knex.schema.table('users', function (table) {
    table.integer('max_api_keys').unsigned().notNullable().defaultTo(1);
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('max_api_keys');
  });
};
