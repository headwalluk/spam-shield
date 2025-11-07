/**
 * Email verification tokens table
 */
exports.up = async function (knex) {
  const has = await knex.schema.hasTable('email_verification_tokens');
  if (!has) {
    await knex.schema.createTable('email_verification_tokens', (table) => {
      table.increments('id').primary();
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.string('token_hash', 64).notNullable().unique(); // sha256 hex length 64
      table.timestamp('expires_at').notNullable();
      table.timestamp('used_at').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('email_verification_tokens');
};
