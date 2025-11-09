// Count countries using the same config stack (loads .env through process).
const db = require('../src/db/knex');
const config = require('../src/config');

(async () => {
  try {
    const [{ c }] = await db('countries').count({ c: '*' });
    console.log('countries.count', Number(c));
    if (Number(c) < 200) {
      console.warn('WARNING: Expected ~250 countries including Unknown; count seems low.');
    }
    console.log('db.database', config.db.database);
  } catch (e) {
    console.error('count failed', e.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
})();
