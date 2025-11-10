const request = require('supertest');
const app = require('../../src/app');

describe('Partials are served unchanged', () => {
  test('GET /partials/footer.html returns fragment without <html> tag', async () => {
    const res = await request(app).get('/partials/footer.html');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<div class="container');
    expect(res.text).not.toMatch(/<html\b/i);
  });
});
