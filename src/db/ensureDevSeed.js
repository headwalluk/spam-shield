// Idempotent seeding for development environment
// Ensures baseline data exists without deleting existing rows

module.exports = async function ensureDevSeed(knex) {
  // Ensure roles table has baseline roles
  try {
    const hasRoles = await knex.schema.hasTable('roles');
    if (!hasRoles) {
      return;
    }

    const existing = await knex('roles').select('name');
    const names = new Set(existing.map((r) => r.name));

    const required = ['user', 'administrator'];
    const missing = required.filter((name) => !names.has(name));

    if (missing.length) {
      await knex('roles').insert(missing.map((name) => ({ name })));
    }
  } catch (err) {
    // Log but don't crash dev server; it's better to still boot
    console.warn('ensureDevSeed warning:', err.message);
  }

  // Ensure user_statuses table has baseline statuses
  try {
    const hasStatuses = await knex.schema.hasTable('user_statuses');
    if (!hasStatuses) {
      return;
    }

    const existing = await knex('user_statuses').select('slug');
    const slugs = new Set(existing.map((s) => s.slug));
    const required = [
      { slug: 'active', title: 'Active' },
      { slug: 'pending', title: 'Pending confirmation' },
      { slug: 'suspended', title: 'Suspended' }
    ];
    const missing = required.filter((r) => !slugs.has(r.slug));
    if (missing.length) {
      await knex('user_statuses').insert(missing);
    }
  } catch (err) {
    console.warn('ensureDevSeed (statuses) warning:', err.message);
  }
};
