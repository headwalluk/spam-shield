const request = require('supertest');
const app = require('../../src/app');

describe('Swagger UI canonicalization (allow trailing slash)', () => {
  test('GET /doc/api redirects to /doc/api/ (swagger behavior)', async () => {
    const res = await request(app).get('/doc/api');
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.location).toMatch(/\/doc\/api\/?$/);
  });

  test('GET /doc/api/ returns 200 HTML', async () => {
    const res = await request(app).get('/doc/api/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toMatch(/<title>.*Swagger UI.*<\/title>|<div id="swagger-ui">/i);
  });
});
