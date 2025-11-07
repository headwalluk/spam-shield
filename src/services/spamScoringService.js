class SpamScoringService {
  constructor(options = {}) {
    this.threshold = options.threshold || 5; // configurable spam threshold
  }

  calculateSpamScore(message = '') {
    if (typeof message !== 'string') {
      return 0;
    }
    let score = 0;
    const lower = message.toLowerCase();

    // Example criteria for scoring
    if (/[£$€]\d+/.test(lower)) {
      score += 2;
    } // money amounts
    if (lower.includes('free')) {
      score += 2;
    }
    if (lower.includes('win')) {
      score += 3;
    }
    if (lower.includes('click here')) {
      score += 5;
    }
    if (lower.length > 500) {
      score += 1;
    } // very long message heuristic

    return score;
  }

  isSpam(message) {
    const score = this.calculateSpamScore(message);
    return score > this.threshold;
  }
}

// Export both the class and a default instance
module.exports = { SpamScoringService, spamScoringService: new SpamScoringService() };
