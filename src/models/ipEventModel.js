const db = require('../db/knex');

async function logEvent({ address, country = '??', caller = null, flags = {} }) {
  const row = {
    address,
    country: country || '??',
    caller,
    is_spam: !!flags.is_spam,
    is_failed_login: !!flags.is_failed_login,
    is_hard_block: !!flags.is_hard_block,
    is_abuse: !!flags.is_abuse
  };
  await db('ip_events').insert(row);
}

async function aggregateReputation(address) {
  const [agg] = await db('ip_events')
    .select(
      db.raw('SUM(is_spam) as spamEvents'),
      db.raw('SUM(is_failed_login) as failedLogins'),
      db.raw('SUM(is_hard_block) as hardBlocks'),
      db.raw('SUM(is_abuse) as abuseEvents'),
      db.raw('COUNT(*) as totalEvents')
    )
    .where({ address });

  const spamEvents = Number(agg?.spamEvents) || 0;
  const failedLogins = Number(agg?.failedLogins) || 0;
  const hardBlocks = Number(agg?.hardBlocks) || 0;
  const abuseEvents = Number(agg?.abuseEvents) || 0;
  const totalEvents = Number(agg?.totalEvents) || 0;

  const score = spamEvents * 1.5 + abuseEvents * 1.2 + failedLogins * 0.5 + hardBlocks * 3.0;

  return {
    address,
    reputationScore: score,
    spamEvents,
    failedLogins,
    hardBlocks,
    abuseEvents,
    totalEvents,
    isSpammer: score >= 5,
    isHeavySpammer: score >= 15
  };
}

async function getLatestCountryForIp(address) {
  const row = await db('ip_events')
    .where({ address })
    .orderBy('event_time', 'desc')
    .first('country');
  return row ? row.country : null;
}

module.exports = { logEvent, aggregateReputation, getLatestCountryForIp };
