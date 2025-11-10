const request = require('supertest');
const app = require('../../src/app');

// This test does not hit the database; it only requests static HTML.
// It validates that the server-side theme cookie rewriting updates the <html> tag.

describe('Theme cookie HTML rewrite', () => {
  test('defaults to light when cookie missing and sets cookie', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/<html[^>]*data-bs-theme="light"/);
    // Should set a Set-Cookie header for theme=light
    const setCookie = res.headers['set-cookie'] || [];
    expect(setCookie.join('\n')).toMatch(/theme=light/);
  });

  for (const theme of ['dark', 'light']) {
    test(`applies ${theme} theme from cookie`, async () => {
      const res = await request(app).get('/').set('Cookie', `theme=${theme}`);
      expect(res.status).toBe(200);
      expect(res.text).toMatch(new RegExp(`<html[^>]*data-bs-theme="${theme}"`));
      // Should not set cookie if already valid
      const setCookie = res.headers['set-cookie'] || [];
      expect(setCookie.join('\n')).not.toMatch(/theme=/);
    });
  }

  test('invalid theme cookie falls back to light and sets cookie', async () => {
    const res = await request(app).get('/').set('Cookie', 'theme=invalid');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/<html[^>]*data-bs-theme="light"/);
    const setCookie = res.headers['set-cookie'] || [];
    expect(setCookie.join('\n')).toMatch(/theme=light/);
  });
});

describe('Theme cookie on extensionless routes', () => {
  test('dash index honors dark cookie', async () => {
    const res = await request(app).get('/dash').set('Cookie', 'theme=dark');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/<html[^>]*data-bs-theme="dark"/);
  });
  test('dash index defaults to light without cookie', async () => {
    const res = await request(app).get('/dash');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/<html[^>]*data-bs-theme="light"/);
  });
});
