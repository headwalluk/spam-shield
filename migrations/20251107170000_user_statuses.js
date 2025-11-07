/**
 * Add user_statuses lookup (slug PK) and link users.status_slug
 */

exports.up = async function (knex) {
  // Create user_statuses table with slug as primary key
  const hasStatuses = await knex.schema.hasTable('user_statuses');
  if (!hasStatuses) {
    await knex.schema.createTable('user_statuses', (table) => {
      table.string('slug', 50).primary();
      table.string('title', 100).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.boolean('is_final').notNullable().defaultTo(false); // e.g. suspended could be final
    });

    // Seed baseline statuses
    await knex('user_statuses').insert([
      { slug: 'active', title: 'Active' },
      { slug: 'pending', title: 'Pending confirmation' },
      { slug: 'suspended', title: 'Suspended' }
    ]);
  }

  // Add status_slug to users (default 'active'), referencing user_statuses.slug
  const hasStatusColumn = await knex.schema.hasColumn('users', 'status_slug');
  if (!hasStatusColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.string('status_slug', 50).notNullable().defaultTo('pending');
      table
        .foreign('status_slug')
        .references('slug')
        .inTable('user_statuses')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');
    });
  }
};

exports.down = async function (knex) {
  // Remove FK and column from users, then drop user_statuses
  const hasStatusColumn = await knex.schema.hasColumn('users', 'status_slug');
  if (hasStatusColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.dropForeign('status_slug');
      table.dropColumn('status_slug');
    });
  }
  await knex.schema.dropTableIfExists('user_statuses');
};
