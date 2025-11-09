/** Seed: ensure Unknown country exists */

exports.seed = async function seed(knex) {
  const exists = await knex('countries').where({ country_code2: '??' }).first();
  if (!exists) {
    await knex('countries').insert({
      country_code2: '??',
      name: 'Unknown',
      score: 0,
      country_code3: null
    });
  }
};
