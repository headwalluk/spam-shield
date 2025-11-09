const db = require('../db/knex');

async function getByCode2(code2) {
  if (!code2) {
    return null;
  }
  return db('countries').where({ country_code2: code2 }).first();
}

async function upsert(country) {
  const row = {
    country_code2: country.country_code2,
    name: country.name,
    score: country.score ?? 0,
    country_code3: country.country_code3 ?? null
  };
  const existing = await getByCode2(row.country_code2);
  if (existing) {
    await db('countries').where({ country_code2: row.country_code2 }).update(row);
  } else {
    await db('countries').insert(row);
  }
  return row;
}

async function setScore(code2, score) {
  await db('countries').where({ country_code2: code2 }).update({ score });
}

async function listAll() {
  return db('countries').select('*').orderBy('name');
}

module.exports = { getByCode2, upsert, setScore, listAll };
