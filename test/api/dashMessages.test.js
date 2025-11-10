const request = require('supertest');
const app = require('../../src/app');
const messageModel = require('../../src/models/messageModel');

describe('GET /api/dash/messages', () => {
  test('requires auth', async () => {
    const res = await request(app).get('/api/dash/messages');
    expect(res.status).toBe(401);
  });

  test('lists paginated user messages and supports search', async () => {
    // Inject test user via header
  // Initial request setup (not used directly; subsequent requests set roles header explicitly)
  // request(app).get('/api/dash/messages');
    // Seed some messages for user id -1 (test user)
    for (let i = 0; i < 15; i++) {
      await messageModel.logMessage({
        user_id: -1,
        sender_ip: '192.0.2.' + i,
        is_spam: i % 2 === 0,
        is_ham: i % 2 === 1,
        message_body: 'Hello world ' + i + (i === 7 ? ' special-keyword' : ''),
        message_fields: { form: 'contact', idx: i },
        classifiers: { dummy: true },
        result: i % 2 === 0 ? 'Spam' : 'Ham',
        time_to_result: 3,
        sender_country: 'GB'
      });
    }

    const resPage1 = await request(app)
      .get('/api/dash/messages?page=1&pageSize=10')
      .set('X-Test-Roles', 'user');
    expect(resPage1.status).toBe(200);
    expect(resPage1.body.items.length).toBe(10);
    expect(resPage1.body.pagination.total).toBeGreaterThanOrEqual(15);

    const resSearch = await request(app)
      .get('/api/dash/messages?page=1&pageSize=10&q=special-keyword')
      .set('X-Test-Roles', 'user');
    expect(resSearch.status).toBe(200);
    expect(resSearch.body.items.length).toBe(1);
    expect(resSearch.body.items[0].message_body).toContain('special-keyword');
  });
});
