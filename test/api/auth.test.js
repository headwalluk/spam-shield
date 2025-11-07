const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db/knex');

// Helper to extract session cookie
function getSessionCookie(res) {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) {
    return null;
  }
  // express-session cookie name from config (defaults to 'sid')
  return setCookie.find((c) => c.startsWith('sid='));
}

// NOTE: These tests require a configured test database. Skipping by default until test DB is set up.
describe.skip('Auth API', () => {
  const email = `user_${Date.now()}@example.com`;
  const password = 'TestPass123!';

  afterAll(async () => {
    await db.destroy();
  });

  test('register -> login -> me flow', async () => {
    // Register
    const regRes = await request(app).post('/api/v3/auth/register').send({ email, password });

    expect(regRes.status).toBeLessThan(400);
    expect(regRes.body).toBeDefined();
    expect(regRes.body.email).toBe(email);

    // Login
    const loginRes = await request(app).post('/api/v3/auth/login').send({ email, password });

    expect(loginRes.status).toBe(200);
    const cookie = getSessionCookie(loginRes);
    expect(cookie).toBeTruthy();

    // Me
    const meRes = await request(app).get('/api/v3/auth/me').set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe(email);
    expect(Array.isArray(meRes.body.roles)).toBe(true);
    expect(meRes.body.roles).toContain('user');
  });

  test('login fails with wrong password', async () => {
    const badLogin = await request(app)
      .post('/api/v3/auth/login')
      .send({ email, password: 'WrongPassword!' });

    // Could be 401 or 400 depending on controller; just ensure failure
    expect([400, 401]).toContain(badLogin.status);
  });
});
