const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Hello World');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toMatchObject({
      id: expect.any(String),
      ownerId: expect.any(String),
      created: expect.any(String),
      updated: expect.any(String),
      type: 'text/plain',
      size: 11
    });
    expect(res.headers.location).toMatch(/\/v1\/fragments\/[0-9a-f-]+$/);
  });

  test('unauthenticated requests return 401', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('Hello World');

    expect(res.statusCode).toBe(401);
  });

  test('unsupported content type returns 415', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send('{"test": "data"}');

    expect(res.statusCode).toBe(415);
  });

  test('missing content type returns 400', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('Hello World');

    expect(res.statusCode).toBe(400);
  });
});
