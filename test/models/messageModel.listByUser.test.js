const messageModel = require('../../src/models/messageModel');

describe('messageModel.listByUser', () => {
  test('returns empty for invalid user id', async () => {
    const res = await messageModel.listByUser(null);
    expect(res.items).toHaveLength(0);
    expect(res.pagination.total).toBe(0);
  });

  test('lists messages for a user ordered by event_time desc', async () => {
    // Insert three messages for user 42
    for (let i = 0; i < 3; i++) {
      await messageModel.logMessage({
        user_id: 42,
        sender_ip: '127.0.0.1',
        is_spam: i === 2,
        is_ham: i !== 2,
        message_body: `Test message ${i}`,
        message_fields: null,
        classifiers: { test: true },
        result: i === 2 ? 'Spam' : 'Ham',
        time_to_result: 5,
        sender_country: 'GB'
      });
    }
    const res = await messageModel.listByUser(42, { page: 1, pageSize: 10 });
    expect(res.items.length).toBeGreaterThanOrEqual(3);
    // Ensure all rows belong to user 42
    expect(res.items.every((r) => r.user_id === 42)).toBe(true);
    // Check ordering desc by event_time (monotonic non-increasing)
    for (let i = 1; i < res.items.length; i++) {
      expect(new Date(res.items[i - 1].event_time) >= new Date(res.items[i].event_time)).toBe(true);
    }
  });
});
