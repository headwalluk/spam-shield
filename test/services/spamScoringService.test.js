const { SpamScoringService } = require('../../src/services/spamScoringService');

describe('SpamScoringService', () => {
  let spamScoringService;

  beforeEach(() => {
    spamScoringService = new SpamScoringService({ threshold: 2.9 });
  });

  test('should return a score of 0 for a clean message', () => {
    const message = 'Hello, how are you?';
    const score = spamScoringService.calculateSpamScore(message);
    expect(score).toBe(0);
  });

  test('should return a correct score for a spammy message', () => {
    const message = 'Congratulations! You can WIN £1000 cash for free, just click here!';
    const score = spamScoringService.calculateSpamScore(message);
    expect(score).toBe(4.0); // 1.0 (win) + 1.5 (money) + 0.5 (free) + 1.0 (click here)
  });

  test('should classify a high-scoring message as spam', () => {
    const message = 'Congratulations! You can WIN £1000 cash for free, just click here!';
    expect(spamScoringService.isSpam(message)).toBe(true);
  });

  test('should classify a low-scoring message as not spam', () => {
    const message = 'Hello, how are you?';
    expect(spamScoringService.isSpam(message)).toBe(false);
  });

  test('should handle empty messages', () => {
    const message = '';
    const score = spamScoringService.calculateSpamScore(message);
    expect(score).toBe(0);
  });

  test('should score messages with all upper case words', () => {
    const message = 'THIS IS URGENT PLEASE READ NOW';
    const score = spamScoringService.calculateSpamScore(message);
    expect(score).toBe(1.0);
  });

  test('should score messages with excessive punctuation', () => {
    const message = 'Hello!!! How are you??? I am great!! Thanks for asking...';
    const score = spamScoringService.calculateSpamScore(message);
    expect(score).toBe(0.5);
  });
});
