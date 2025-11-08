class SpamScoringService {
  constructor(options = {}) {
    this.threshold = options.threshold || 2.9; // Default spam threshold
    this.classifiers = [
      this._containsMoney,
      this._containsFree,
      this._containsWin,
      this._containsClickHere,
      this._isLongMessage,
      this._hasAllUpperCaseWords,
      this._hasExcessivePunctuation
    ];
  }

  /**
   * Calculates the spam score for a given message.
   * @param {string} message - The message to score.
   * @returns {number} The total spam score.
   */
  calculateSpamScore(message = '') {
    if (typeof message !== 'string' || message.trim() === '') {
      return 0;
    }

    const lowerCaseMessage = message.toLowerCase();
    let totalScore = 0;

    for (const classifier of this.classifiers) {
      totalScore += classifier(message, lowerCaseMessage);
    }

    return totalScore;
  }

  /**
   * Determines if a message is spam based on its score.
   * @param {string} message - The message to check.
   * @returns {boolean} True if the message is spam, false otherwise.
   */
  isSpam(message) {
    const score = this.calculateSpamScore(message);
    return score > this.threshold;
  }

  // Private classifier methods

  _containsMoney(message, _lowerCaseMessage) {
    return /[£$€]\d+/.test(message) ? 1.5 : 0;
  }

  _containsFree(message, lowerCaseMessage) {
    return lowerCaseMessage.includes('free') ? 0.5 : 0;
  }

  _containsWin(message, lowerCaseMessage) {
    return lowerCaseMessage.includes('win') ? 1.0 : 0;
  }

  _containsClickHere(message, lowerCaseMessage) {
    return lowerCaseMessage.includes('click here') ? 1.0 : 0;
  }

  _isLongMessage(message, _lowerCaseMessage) {
    return message.length > 500 ? 0.5 : 0;
  }

  _hasAllUpperCaseWords(message, _lowerCaseMessage) {
    const words = message.split(/\s+/);
    const upperCaseWords = words.filter((word) => word.length > 1 && word === word.toUpperCase());
    return upperCaseWords.length > 2 ? 1.0 : 0;
  }

  _hasExcessivePunctuation(message, _lowerCaseMessage) {
    const punctuation = (message.match(/[!?.&]/g) || []).length;
    return punctuation > 5 ? 0.5 : 0;
  }
}

// Export both the class and a default instance
module.exports = { SpamScoringService, spamScoringService: new SpamScoringService() };
