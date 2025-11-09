const emailTemplates = require('../../src/services/emailTemplates');

describe('emailTemplates', () => {
  beforeEach(() => {
    emailTemplates._clearCache();
  });

  test('verify-email template renders link and URL', () => {
    const verifyUrl = 'https://example.com/verify-email?token=abc123';
    const html = emailTemplates.render('verify-email', { verifyUrl });
    expect(html).toContain(verifyUrl);
    // Template uses single quotes around attribute values; relax regex to allow either quote
    expect(html).toMatch(/<a\s+href=['"]https:\/\/example.com\/verify-email\?token=abc123['"]/);
  });

  test('verify-email template without URL still renders skeleton', () => {
    const html = emailTemplates.render('verify-email', {});
    // Should include heading
    expect(html).toContain('Verify your email');
  });
});
