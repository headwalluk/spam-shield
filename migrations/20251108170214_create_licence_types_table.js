exports.up = function (knex) {
  return knex.schema
    .createTable('licence_types', function (table) {
      table.string('slug').primary();
      table.string('title').notNullable();
    })
    .then(function () {
      return knex('licence_types').insert([
        { slug: 'unmetered', title: 'Unmetered' },
        { slug: 'daily-metered', title: 'Daily Metered' }
      ]);
    })
    .then(function () {
      return knex.schema.alterTable('licences', function (table) {
        table.string('licence_type').notNullable().alter();
        table.foreign('licence_type').references('licence_types.slug');
      });
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('licences', function (table) {
      table.dropForeign('licence_type');
    })
    .then(function () {
      return knex.schema.alterTable('licences', function (table) {
        table.enum('licence_type', ['unmetered', 'daily-metered']).notNullable().alter();
      });
    })
    .then(function () {
      return knex.schema.dropTable('licence_types');
    });
};
