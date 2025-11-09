/** Seed: initial bad phrases */

exports.seed = async function (knex) {
  const existing = await knex('bad_phrases').select('id');
  if (existing.length > 0) {
    return; // idempotent
  }
  await knex('bad_phrases').insert([
    { phrase: 'click here', score: 2.0 },
    { phrase: 'win money', score: 1.5 },
    { phrase: 'free trial', score: 1.2 }
  ]);
};
