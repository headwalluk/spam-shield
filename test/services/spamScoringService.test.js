const { SpamScoringService } = require('../../src/services/spamScoringService');

describe('SpamScoringService', () => {
  let spamScoringService;

  beforeEach(() => {
    spamScoringService = new SpamScoringService();
  });

  test('should return a score for a given message', () => {
    const message = 'This is a test message.';
    const score = spamScoringService.calculateSpamScore(message);
    expect(score).toBeDefined();
    expect(typeof score).toBe('number');
  });

  test('should classify a message as spam', () => {
    const message = 'Congratulations! You can WIN big prizes, click here!';
    expect(spamScoringService.isSpam(message)).toBe(true);
  });

  test('should classify a message as not spam', () => {
    const message = 'Hello, how are you?';
    expect(spamScoringService.isSpam(message)).toBe(false);
  });

  test('should handle empty messages', () => {
    const message = '';
    const score = spamScoringService.calculateSpamScore(message);
    expect(score).toBeDefined();
    expect(typeof score).toBe('number');
  });
});
