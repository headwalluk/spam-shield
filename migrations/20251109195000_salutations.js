/**
 * Migration: create salutations lookup table
 */

exports.up = async function up(knex) {
  const has = await knex.schema.hasTable('salutations');
  if (!has) {
    await knex.schema.createTable('salutations', (table) => {
      table.bigIncrements('id').primary();
      table.string('phrase', 100).notNullable().unique();
      table.float('score').notNullable().defaultTo(0);
    });
  }
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('salutations');
};
