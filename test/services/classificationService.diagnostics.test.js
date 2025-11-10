// Ensure development mode for diagnostics
const prevEnv = process.env.NODE_ENV;
process.env.NODE_ENV = 'development';

// Mock DB-backed models to avoid real connections
jest.mock('../../src/models/messageModel', () => ({
  logMessage: jest.fn().mockResolvedValue(true)
}));
jest.mock('../../src/models/ipEventModel', () => ({
  logEvent: jest.fn().mockResolvedValue(true),
  getLatestCountryForIp: jest.fn().mockResolvedValue(null)
}));

const { classifyAndLog } = require('../../src/services/classificationService');

afterAll(() => {
  process.env.NODE_ENV = prevEnv;
});

describe('classificationService diagnostics in development', () => {
  test('includes diagnostics.tokenizedMessage in response', async () => {
    const res = await classifyAndLog({
      ip: '1.2.3.4',
      fields: {},
      message: 'Hello dear friend from example.org',
      caller: 'example.org',
      hints: {}
    });
    expect(res).toHaveProperty('diagnostics.tokenizedMessage');
    const tok = res.diagnostics.tokenizedMessage;
    expect(tok).toHaveProperty('sanitised');
    expect(Array.isArray(tok.words)).toBe(true);
  });
});
