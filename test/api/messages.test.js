const request = require('supertest');
const app = require('../../src/app');

describe('Messages API', () => {
  it('should create a new message', async () => {
    const response = await request(app)
      .post('/api/messages')
      .send({
        text: 'This is a test message',
        sender: 'test@example.com'
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.text).toBe('This is a test message');
  });

  it('should retrieve a message by ID', async () => {
    const messageId = 1; // Assuming a message with ID 1 exists
    const response = await request(app).get(`/api/messages/${messageId}`).expect(200);

    expect(response.body).toHaveProperty('id', messageId);
  });

  it('should update a message', async () => {
    const messageId = 1; // Assuming a message with ID 1 exists
    const response = await request(app)
      .put(`/api/messages/${messageId}`)
      .send({
        text: 'This is an updated test message'
      })
      .expect(200);

    expect(response.body.text).toBe('This is an updated test message');
  });

  it('should delete a message', async () => {
    const messageId = 1; // Assuming a message with ID 1 exists
    await request(app).delete(`/api/messages/${messageId}`).expect(204);
  });

  it('should return 404 for a non-existing message', async () => {
    const messageId = 999; // Assuming this ID does not exist
    const response = await request(app).get(`/api/messages/${messageId}`).expect(404);

    expect(response.body).toHaveProperty('error', 'Message not found');
  });
});
