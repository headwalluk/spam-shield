/**
 * Message Tokenizer
 *
 * Normalises and tokenises an input message string, extracting:
 * - raw / rawPadded
 * - normalised (lowercased, unicode normalised, caller domain removed if provided)
 * - stripped (HTML + URLs removed)
 * - sanitised (letters only with single-space collapsing)
 * - salutation info (uses cached salutations model)
 * - word list
 * - character counts
 *
 * Caller domain is removed entirely to avoid bias in scoring later.
 */
const salutationsModel = require('../models/salutationsModel');

// Lightweight normaliser: NFKC + trim + lowercase.
function basicNormalise(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str.normalize('NFKC').trim().toLowerCase();
}

// Certain visually confusable Unicode characters mapped to ASCII.
const equivalentChars = {
  а: 'a',
  е: 'e',
  о: 'o',
  р: 'p',
  с: 'c',
  у: 'y',
  ѕ: 's',
  і: 'i',
  ԝ: 'w',
  ǃ: '!',
  н: 'h',
  ι: 'i',
  à: 'a'
};

// Leading letter test (restrict tokens to letters; others replaced by space).
const regexLetter = /^\p{L}$/u;

function tokenize(message, { caller = null, skipSalutations = false } = {}) {
  const raw = typeof message === 'string' ? message : '';
  const baseNormalised = basicNormalise(raw);
  // Build stripped from the base string BEFORE caller removal to avoid breaking URL patterns
  const stripped = baseNormalised
    .replace(/(<([^>]+)>)/gi, ' ') // strip HTML tags
    .replace(/(?:https?|ftp):\/\/[^\s]+/gi, ' ') // strip URLs
    .toLowerCase();

  // Then apply caller removal for the main normalised pipeline
  let normalised = baseNormalised;
  if (caller) {
    const c = caller.toLowerCase();
    normalised = normalised.replaceAll(c, ' ');
  }

  const characters = [];
  const length = normalised.length;
  let index = 0;
  let wasLastSpace = false;
  let nonSpaceCharacterCount = 0;

  while (index < length) {
    let ch = normalised.charAt(index);
    if (equivalentChars[ch]) {
      ch = equivalentChars[ch];
    }
    // Replace non-letters with space
    if (!regexLetter.test(ch)) {
      ch = ' ';
    }
    if (ch === ' ') {
      if (!wasLastSpace) {
        characters.push(ch);
      }
      wasLastSpace = true;
    } else {
      characters.push(ch);
      wasLastSpace = false;
      ++nonSpaceCharacterCount;
    }
    ++index;
  }

  const sanitised = characters.join('').trim();
  let sanitisedWithoutSalutation = sanitised;
  const foundSalutations = [];
  let salutationScore = 0;
  let foundSalutation = '';

  if (!skipSalutations && sanitised.length) {
    // Use cached salutations from model
    const allSalutations = salutationsModel.getPhrasesForClassification();
    if (allSalutations.length) {
      // Build phrase list and score map
  const items = allSalutations.map((s) => ({ phrase: s.phrase.toLowerCase(), score: s.score }));
      // Scan from start for chained salutations followed by space
      let startOffset = 0;
      let scanIteration = 0;
      let foundOnThisPass = 0;
      const sanitisedPaddedRight = `${sanitised} `;

      do {
        foundOnThisPass = 0;
        for (const s of items) {
          const test = `${s.phrase} `;
          if (sanitisedPaddedRight.substring(startOffset, startOffset + test.length) === test) {
            foundSalutations.push(s.phrase);
            salutationScore += s.score;
            startOffset += test.length;
            foundOnThisPass++;
            break; // restart phrases from new offset
          }
        }
        scanIteration++;
      } while (scanIteration === 0 || foundOnThisPass > 0);

      if (foundSalutations.length) {
        foundSalutation = foundSalutations.join(' ');
        sanitisedWithoutSalutation = sanitised.substring(foundSalutation.length).trim();
      }
    }
  }

  return {
    raw,
    rawPadded: ` ${raw} `,
    normalised,
    stripped,
    sanitised,
    sanitisedPadded: ` ${sanitised} `,
    sanitisedWithoutSalutation,
    salutation: foundSalutation,
    allSalutations: foundSalutations,
    salutationScore,
    words: sanitised.split(' ').filter(Boolean),
    nonSpaceCharacterCount
  };
}

module.exports = { tokenize };
