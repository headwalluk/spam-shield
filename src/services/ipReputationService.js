const ipEventModel = require('../models/ipEventModel');
const countryModel = require('../models/countryModel');

const AllowedEvents = new Set(['spam', 'failed_login', 'hard_block', 'abuse']);

async function getIpReputation(address) {
  const agg = await ipEventModel.aggregateReputation(address);
  const code2 = (await ipEventModel.getLatestCountryForIp(address)) || '??';
  const meta = await countryModel.getByCode2(code2);
  return {
    ...agg,
    country: code2,
    countryName: meta?.name || 'Unknown',
    countryScore: meta?.score ?? 0
  };
}

async function logIpEvent(address, eventName, opts = {}) {
  const name = String(eventName || '').toLowerCase();
  if (!AllowedEvents.has(name)) {
    const err = new Error('Invalid event');
    err.status = 400;
    throw err;
  }
  const flagMap = {
    spam: { is_spam: true },
    failed_login: { is_failed_login: true },
    hard_block: { is_hard_block: true },
    abuse: { is_abuse: true }
  };
  const flags = flagMap[name] || {};
  await ipEventModel.logEvent({
    address,
    country: opts.country || '??',
    caller: opts.caller || null,
    flags
  });
  return getIpReputation(address);
}

module.exports = { getIpReputation, logIpEvent, AllowedEvents };
