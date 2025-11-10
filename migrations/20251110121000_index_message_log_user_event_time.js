/**
 * Migration: add composite index for frequent dashboard queries
 * Index: message_log(user_id ASC, event_time DESC)
 * Note: Most engines ignore explicit DESC in index definition; the composite index
 * on (user_id, event_time) still benefits ORDER BY event_time DESC queries per user.
 */

exports.up = async function up(knex) {
  const hasTable = await knex.schema.hasTable('message_log');
  if (!hasTable) {
    return;
  }
  await knex.schema.alterTable('message_log', (table) => {
    table.index(['user_id', 'event_time'], 'message_log_user_event_time_idx');
  });
};

exports.down = async function down(knex) {
  const hasTable = await knex.schema.hasTable('message_log');
  if (!hasTable) {
    return;
  }
  await knex.schema.alterTable('message_log', (table) => {
    table.dropIndex(['user_id', 'event_time'], 'message_log_user_event_time_idx');
  });
};
