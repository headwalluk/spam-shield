/**
 * Migration: create bad_phrases lookup table
 */

exports.up = async function up(knex) {
  const has = await knex.schema.hasTable('bad_phrases');
  if (!has) {
    await knex.schema.createTable('bad_phrases', (table) => {
      table.bigIncrements('id').primary();
      table.string('phrase', 100).notNullable().unique();
      table.float('score').notNullable().defaultTo(0.5);
    });
  }
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('bad_phrases');
};
