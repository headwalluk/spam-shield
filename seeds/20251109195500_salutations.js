/** Seed: initial salutations */
exports.seed = async function (knex) {
  const existing = await knex('salutations').count('* as c');
  const count = Number(existing[0].c) || 0;
  if (count > 0) {
    return;
  } // idempotent

  await knex('salutations').insert([
    { phrase: 'hello', score: 0 },
    { phrase: 'hi', score: 0 },
    { phrase: 'dear', score: 0 },
    { phrase: 'greetings', score: 0 },
    { phrase: 'hey', score: 0 }
  ]);
};
