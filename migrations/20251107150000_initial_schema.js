/**
 * Initial schema: roles, users, licences, messages
 * (Removed legacy custom sessions table; express-session uses separate web_sessions internally.)
 */

exports.up = async function (knex) {
  // Roles
  await knex.schema.createTable('roles', (table) => {
    table.increments('id').primary();
    table.string('name', 50).notNullable().unique();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Users
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // User <-> Roles (many-to-many)
  await knex.schema.createTable('user_roles', (table) => {
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table
      .integer('role_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('roles')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    table.primary(['user_id', 'role_id']);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Licences (one-to-one with users)
  await knex.schema.createTable('licences', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .unique()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.enu('licence_type', ['unmetered', 'daily-metered']).notNullable().defaultTo('unmetered');
    // Time of day reset for daily-metered licences in UTC (HH:MM:SS)
    table.time('daily_reset_time_utc').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Messages (existing model expects columns)
  const hasMessages = await knex.schema.hasTable('messages');
  if (!hasMessages) {
    await knex.schema.createTable('messages', (table) => {
      table.increments('id').primary();
      table.text('content').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').nullable();
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('licences');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('roles');
  // messages table intentionally left (comment below) because existing code depends on it.
  // To drop it uncomment the next line.
  // await knex.schema.dropTableIfExists('messages');
};
