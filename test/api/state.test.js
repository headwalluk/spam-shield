const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db/knex');

// Helper: extract session cookie
function getSessionCookie(res) {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) {
    return null;
  }
  return setCookie.find((c) => c.startsWith('sid='));
}

// Skipped by default until test DB is configured like other auth tests
describe.skip('State API', () => {
  afterAll(async () => {
    await db.destroy();
  });

  test('unauthenticated sitemap', async () => {
    const res = await request(app).get('/api/v3/state');
    expect(res.status).toBe(200);
    expect(res.body.isAuthenticated).toBe(false);
    expect(Array.isArray(res.body.sitemap)).toBe(true);
    const login = res.body.sitemap.find((i) => i.text === 'Login');
    expect(login).toBeTruthy();
  });

  test('authenticated sitemap basic roles', async () => {
    // Register + login user (assuming registration enabled & auto-role 'user')
    const email = `state_user_${Date.now()}@example.com`;
    const password = 'StateTest123!';
    const reg = await request(app).post('/api/v3/auth/register').send({ email, password });
    expect([200, 201]).toContain(reg.status);

    const login = await request(app).post('/api/v3/auth/login').send({ email, password });
    expect(login.status).toBe(200);
    const cookie = getSessionCookie(login);
    expect(cookie).toBeTruthy();

    const res = await request(app).get('/api/v3/state').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.isAuthenticated).toBe(true);
    const dash = res.body.sitemap.find((i) => i.text === 'Dashboard');
    expect(dash).toBeTruthy();
  });
});
