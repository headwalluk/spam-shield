const request = require('supertest');
const app = require('../../src/app');

describe('Global trailing slash canonicalization', () => {
  test('Redirects /admin/ -> /admin', async () => {
    const res = await request(app).get('/admin/');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/admin');
  });
  test('Redirects /dash/ -> /dash', async () => {
    const res = await request(app).get('/dash/');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/dash');
  });
  test('Does not redirect /partials/footer.html', async () => {
    const res = await request(app).get('/partials/footer.html');
    expect(res.status).toBe(200);
    expect(res.headers.location).toBeUndefined();
  });
  test('Does not redirect root /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });
});
