const messageModel = require('../models/messageModel');
const ipEventModel = require('../models/ipEventModel');
const { getLatestCountryForIp } = require('../models/ipEventModel');

function basicScorePipeline({ message }) {
  const start = Date.now();
  const m = (message || '').trim();
  const regexScore = /[A-Z]/.test(m) && /[a-z]/.test(m) ? 1.6 : 0;
  const lengthScore = m.length > 120 ? 0.5 : 0;
  const score = regexScore + lengthScore;
  const spamThreshold = 2.5;
  return {
    timing: {
      startISO: new Date(start).toISOString(),
      duration: Date.now() - start
    },
    score,
    isSpam: score >= spamThreshold,
    spamThreshold,
    components: {
      regexScore,
      lengthScore
    }
  };
}

function westernLatinCharRatio(str) {
  if (!str) {
    return 1; // empty treated as all acceptable
  }
  const allowed = /[A-Za-z0-9\s.,!?;:'"\-()]/;
  let allowedCount = 0;
  let total = 0;
  for (const ch of str) {
    if (ch.trim() === '') {
      // whitespace counts as allowed
      allowedCount += 1;
      total += 1;
      continue;
    }
    if (allowed.test(ch)) {
      allowedCount += 1;
    }
    total += 1;
  }
  return total === 0 ? 1 : allowedCount / total;
}

async function classifyAndLog({ ip, fields, message, hints = {}, caller = null }) {
  const start = Date.now();
  const inTest = process.env.NODE_ENV === 'test';
  const pipeline = basicScorePipeline({ message });
  // Attempt to derive country from prior events (best-effort, may be null)
  let senderCountry = null;
  if (ip) {
    try {
      senderCountry = await getLatestCountryForIp(ip);
    } catch {
      // ignore lookup errors
    }
  }

  // Hints evaluation
  const classifiers = {};
  const reasons = [];
  let isSpam = pipeline.isSpam;
  let forced = false;

  // forceToSpam short-circuit
  if (hints.forceToSpam === true) {
    isSpam = true;
    forced = true;
    classifiers['force-spam'] = { activated: true };
    reasons.push('forceToSpam hint true');
  }

  // Country restrictions (only blockList defined by requirement)
  if (
    !forced &&
    hints.countryRestrictions &&
    hints.countryRestrictions.mode === 'blockList' &&
    senderCountry
  ) {
    const list = Array.isArray(hints.countryRestrictions.countryCodes)
      ? hints.countryRestrictions.countryCodes
      : [];
    if (list.includes(senderCountry)) {
      isSpam = true;
      classifiers['country-restriction'] = {
        activated: true,
        mode: 'blockList',
        senderCountry,
        matched: true
      };
      reasons.push(`senderCountry ${senderCountry} in blockList`);
    } else {
      classifiers['country-restriction'] = {
        activated: false,
        mode: 'blockList',
        senderCountry,
        matched: false
      };
    }
  }

  // Script restriction (westernLatin minimum threshold)
  if (
    !forced &&
    hints.scriptRestriction &&
    hints.scriptRestriction.alphabet === 'westernLatin' &&
    hints.scriptRestriction.mode === 'minimumCharacterPercentage'
  ) {
    const threshold =
      typeof hints.scriptRestriction.threshold === 'number'
        ? hints.scriptRestriction.threshold
        : 0.2;
    const ratio = westernLatinCharRatio(message);
    const nonRatio = 1 - ratio;
    const activated = nonRatio > threshold;
    if (activated) {
      isSpam = true;
      reasons.push(`nonLatinRatio ${nonRatio.toFixed(2)} exceeds threshold ${threshold}`);
    }
    classifiers['script-restriction'] = {
      activated,
      alphabet: 'westernLatin',
      mode: 'minimumCharacterPercentage',
      threshold,
      nonLatinRatio: Number(nonRatio.toFixed(4))
    };
  }

  // Base heuristics component
  classifiers['base-heuristics'] = {
    score: pipeline.score,
    components: pipeline.components,
    spamThreshold: pipeline.spamThreshold,
    activated: pipeline.isSpam
  };
  const result = {
    classification: {
      score: pipeline.score,
      description: isSpam ? 'Spam' : 'Ham',
      isSpam,
      isHam: !isSpam,
      hamThreshold: -0.2,
      spamThreshold: pipeline.spamThreshold,
      reasons
    },
    isIpLoggingEnabled: true,
    classifiers,
    sender: {
      ip,
      country: senderCountry,
      countryName: null,
      continentName: null,
      isHeavySpammer: false,
      isSpammer: isSpam
    },
    caller
  };

  if (!inTest) {
    await messageModel.logMessage({
      sender_ip: ip,
      is_spam: result.classification.isSpam,
      is_ham: result.classification.isHam,
      message_body: message,
      message_fields: fields,
      classifiers: result.classifiers,
      result: result.classification.description,
      time_to_result: Date.now() - start,
      sender_country: senderCountry
    });
  }

  if (!inTest && result.classification.isSpam && ip) {
    await ipEventModel.logEvent({
      address: ip,
      flags: { is_spam: true },
      caller,
      country: senderCountry || '??'
    });
  }

  return {
    timing: {
      start: new Date(start).toISOString(),
      end: new Date().toISOString(),
      duration: Date.now() - start,
      today: new Date().toISOString().substring(0, 10)
    },
    result
  };
}

module.exports = { classifyAndLog };
