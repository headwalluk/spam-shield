exports.seed = async function (knex) {
  // Idempotent seed: ensure required roles exist without deleting to avoid FK issues
  const roles = [
    { id: 1, name: 'user' },
    { id: 2, name: 'administrator' }
  ];

  for (const r of roles) {
    const existing = await knex('roles').where({ id: r.id }).first();
    if (existing) {
      if (existing.name !== r.name) {
        await knex('roles').where({ id: r.id }).update({ name: r.name });
      }
    } else {
      await knex('roles').insert(r);
    }
  }
};
