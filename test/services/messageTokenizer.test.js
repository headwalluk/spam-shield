jest.mock('../../src/models/salutationsModel', () => {
  return {
    getPhrasesForClassification: () => [
      { phrase: 'hello', score: 2 },
      { phrase: 'dear friend', score: 1 }
    ]
  };
});

const { tokenize } = require('../../src/services/messageTokenizer');

describe('messageTokenizer', () => {
  test('normalises, strips URLs/HTML, removes caller domain, tokenises words', () => {
    const input = '  <b>Hello</b> there from Example.ORG! Visit https://example.org/page?x=1 ';
    const out = tokenize(input, { caller: 'example.org' });
    expect(out.raw).toBe(input);
    expect(out.normalised).toContain('hello');
    // URL removed
    expect(out.stripped).not.toMatch(/https?:/);
    // caller removed (no literal example.org present)
    expect(out.normalised).not.toContain('example.org');
    // letters-only sanitised
    expect(out.sanitised).toMatch(/^[a-z\s]+$/);
    expect(out.words.length).toBeGreaterThan(0);
  });

  test('detects chained salutations at start and removes from sanitisedWithoutSalutation', () => {
    const input = 'Hello dear friend how are you today';
    const out = tokenize(input);
    expect(out.salutation).toBe('hello dear friend');
    expect(out.salutationScore).toBe(3);
    expect(out.sanitisedWithoutSalutation.startsWith('how')).toBe(true);
  });

  test('skipSalutations=true keeps full sanitised text', () => {
    const input = 'Hello dear friend how are you';
    const out = tokenize(input, { skipSalutations: true });
    expect(out.salutation).toBe('');
    expect(out.salutationScore).toBe(0);
    expect(out.sanitisedWithoutSalutation).toBe(out.sanitised);
  });
});
