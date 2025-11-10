/**
 * Migration: add user_id FK to message_log -> users(id)
 */

exports.up = async function up(knex) {
  const hasTable = await knex.schema.hasTable('message_log');
  if (!hasTable) {
    return;
  }

  const hasColumn = await knex.schema.hasColumn('message_log', 'user_id');
  if (!hasColumn) {
    await knex.schema.alterTable('message_log', (table) => {
      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
        .index();
    });
  }
};

exports.down = async function down(knex) {
  const hasTable = await knex.schema.hasTable('message_log');
  if (!hasTable) {
    return;
  }
  const hasColumn = await knex.schema.hasColumn('message_log', 'user_id');
  if (hasColumn) {
    await knex.schema.alterTable('message_log', (table) => {
      table.dropColumn('user_id');
    });
  }
};
