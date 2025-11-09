const request = require('supertest');
const app = require('../../src/app');

describe('Messages classification API (auth enforced)', () => {
  it('rejects unauthenticated request', async () => {
    await request(app).post('/api/v3/messages').send({ message: 'Hello world' }).expect(401);
  });

  it('rejects request without user role', async () => {
    await request(app)
      .post('/api/v3/messages')
      .set('X-Test-Roles', 'viewer')
      .send({ message: 'Hello world' })
      .expect(403);
  });

  it('classifies a simple ham message with defaults when user role present', async () => {
    const response = await request(app)
      .post('/api/v3/messages')
      .set('X-Test-Roles', 'user')
      .send({ message: 'Hello world' })
      .expect(201);
    expect(response.body).not.toHaveProperty('id');
    expect(response.body).toHaveProperty('result.classification.isSpam', false);
    expect(response.body).toHaveProperty('result.classification.description', 'Ham');
  });

  it('forces spam via hint with user role', async () => {
    const response = await request(app)
      .post('/api/v3/messages')
      .set('X-Test-Roles', 'user')
      .send({ message: 'Innocent message', hints: { forceToSpam: true } })
      .expect(201);
    expect(response.body.result.classification.isSpam).toBe(true);
    expect(response.body.result.classification.reasons).toEqual(
      expect.arrayContaining(['forceToSpam hint true'])
    );
  });

  it('applies script restriction (nonLatin > threshold)', async () => {
    const response = await request(app)
      .post('/api/v3/messages')
      .set('X-Test-Roles', 'user')
      .send({
        message: 'SYSx diwsh uePg NYG yWprZWNF',
        hints: {
          scriptRestriction: {
            alphabet: 'westernLatin',
            mode: 'minimumCharacterPercentage',
            threshold: 0.2
          }
        }
      })
      .expect(201);
    // This string is mostly Latin letters; expect ham (nonLatin ratio low)
    expect(response.body.result.classification.isSpam).toBe(false);
  });

  it('defaults missing properties properly with user role', async () => {
    const response = await request(app)
      .post('/api/v3/messages')
      .set('X-Test-Roles', 'user')
      .send({})
      .expect(201);
    expect(response.body).not.toHaveProperty('id');
    expect(response.body).toHaveProperty('result.classification.isSpam');
  });
});
