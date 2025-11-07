/**
 * Cleanup migration: drop legacy custom 'sessions' table if it exists.
 */

exports.up = async function (knex) {
  const has = await knex.schema.hasTable('sessions');
  if (has) {
    await knex.schema.dropTable('sessions');
  }
};

exports.down = async function (knex) {
  // Recreate original 'sessions' table (for rollback symmetry)
  const has = await knex.schema.hasTable('sessions');
  if (!has) {
    await knex.schema.createTable('sessions', (table) => {
      table.increments('id').primary();
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.string('session_token', 128).notNullable().unique();
      table.timestamp('expires_at').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('last_active_at').nullable();
    });
  }
};
