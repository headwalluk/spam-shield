/**
 * Migration: create ip_events, message_log, countries tables
 */

exports.up = async function up(knex) {
  // ip_events table
  const hasIpEvents = await knex.schema.hasTable('ip_events');
  if (!hasIpEvents) {
    await knex.schema.createTable('ip_events', (table) => {
      table.bigIncrements('id').primary();
      table.string('address', 40).notNullable().index();
      table
        .dateTime('event_time', { precision: 6 })
        .notNullable()
        .defaultTo(knex.fn.now(6))
        .index();
      table
        .string('event_date', 10)
        .notNullable()
        .defaultTo(knex.raw("DATE_FORMAT(CURRENT_TIMESTAMP(6),'%Y-%m-%d')"))
        .index();
      table.string('country', 2).notNullable().defaultTo('??').index();
      table.string('caller', 100);
      table.boolean('is_spam').notNullable().defaultTo(false);
      table.boolean('is_failed_login').notNullable().defaultTo(false);
      table.boolean('is_hard_block').notNullable().defaultTo(false);
      table.boolean('is_abuse').notNullable().defaultTo(false);
      table.index(['address', 'event_date'], 'ip_events_address_event_date_idx');
      table.index(['event_time', 'address'], 'ip_events_time_address_idx');
      table.index(['country'], 'ip_events_country_idx');
    });
  }

  // message_log table
  const hasMessageLog = await knex.schema.hasTable('message_log');
  if (!hasMessageLog) {
    await knex.schema.createTable('message_log', (table) => {
      table.bigIncrements('id').primary();
      table.string('sender_ip', 40).notNullable().index();
      table
        .dateTime('event_time', { precision: 6 })
        .notNullable()
        .defaultTo(knex.fn.now(6))
        .index();
      table.boolean('is_ham').notNullable().defaultTo(false);
      table.boolean('is_spam').notNullable().defaultTo(false);
      table.text('message_body').notNullable().defaultTo('');
      table.json('message_fields');
      table.json('classifiers');
      table.string('result', 128);
      table.bigInteger('time_to_result');
      table.string('sender_country', 2);
      table.index(['event_time'], 'message_log_event_time_idx');
    });
  }

  // countries table
  const hasCountries = await knex.schema.hasTable('countries');
  if (!hasCountries) {
    await knex.schema.createTable('countries', (table) => {
      table.string('country_code2', 2).primary().notNullable();
      table.string('name', 100).notNullable();
      table.float('score').notNullable().defaultTo(0);
      table.string('country_code3', 3);
    });
  }
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('message_log');
  await knex.schema.dropTableIfExists('ip_events');
  await knex.schema.dropTableIfExists('countries');
};
