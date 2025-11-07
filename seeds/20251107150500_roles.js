exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('roles').del();
  await knex('roles').insert([
    { id: 1, name: 'user' },
    { id: 2, name: 'administrator' }
  ]);
  // Reset auto increment to max id
  await knex.raw('ALTER TABLE roles AUTO_INCREMENT = 3');
};
